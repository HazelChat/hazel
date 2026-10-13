import { Config, Context, Effect, Layer, Schema } from "effect"

/**
 * Sends organization invitation emails. On the api Worker this is Cloudflare Email Sending
 * (the `EMAIL` binding; `alchemy dev` writes the message to `.alchemy/local/email` instead).
 * On Bun, and wherever the binding is absent, the link is logged so local invites still work.
 */

export interface InviteEmail {
	readonly to: string
	readonly organizationName: string
	readonly inviterName: string
	readonly acceptUrl: string
}

export class InviteEmailError extends Schema.TaggedError<InviteEmailError>()("InviteEmailError", {
	message: Schema.String,
}) {}

/** The part of the Workers `send_email` binding this uses. */
export interface EmailBinding {
	readonly send: (message: {
		readonly from: { readonly email: string; readonly name: string }
		readonly to: string
		readonly subject: string
		readonly text: string
		readonly html: string
	}) => Promise<unknown>
}

export const isEmailBinding = (value: unknown): value is EmailBinding =>
	typeof value === "object" && value !== null && "send" in value && typeof value.send === "function"

const escapeHtml = (value: string) =>
	value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

export const renderInviteEmail = (invite: InviteEmail) => {
	const subject = `${invite.inviterName} invited you to ${invite.organizationName} on Hazel`
	const text = [
		`${invite.inviterName} invited you to join ${invite.organizationName} on Hazel.`,
		"",
		`Accept the invitation: ${invite.acceptUrl}`,
		"",
		`Sign in with the account for ${invite.to}. The link expires in 7 days.`,
	].join("\n")
	const html = `<!doctype html>
<html><body style="margin:0;padding:32px;background:#f6f6f7;font-family:Inter,-apple-system,Segoe UI,sans-serif;color:#18181b">
<table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px">
<tr><td>
<p style="margin:0 0 8px;font-size:18px;font-weight:600">Join ${escapeHtml(invite.organizationName)} on Hazel</p>
<p style="margin:0 0 24px;font-size:14px;line-height:20px;color:#52525b">${escapeHtml(invite.inviterName)} invited you to their workspace.</p>
<a href="${escapeHtml(invite.acceptUrl)}" style="display:inline-block;background:#6938ef;color:#fff;text-decoration:none;font-size:14px;font-weight:500;padding:10px 16px;border-radius:8px">Accept invitation</a>
<p style="margin:24px 0 0;font-size:12px;line-height:18px;color:#71717a">Sign in with the account for ${escapeHtml(invite.to)}. The link expires in 7 days. If you weren't expecting this, you can ignore it.</p>
</td></tr></table>
</body></html>`
	return { subject, text, html }
}

export class InviteMailer extends Context.Service<
	InviteMailer,
	{ readonly send: (invite: InviteEmail) => Effect.Effect<void, InviteEmailError> }
>()("InviteMailer") {
	/** Cloudflare Email Sending through the Worker's `send_email` binding. */
	static readonly layerBinding = (binding: EmailBinding) =>
		Layer.effect(
			InviteMailer,
			Effect.gen(function* () {
				const from = yield* Config.String("INVITE_EMAIL_FROM").pipe(
					Config.withDefault("invites@hazel.sh"),
				)
				return {
					send: Effect.fn("InviteMailer.send")(function* (invite: InviteEmail) {
						const { subject, text, html } = renderInviteEmail(invite)
						yield* Effect.tryPromise({
							try: () =>
								binding.send({
									from: { email: from, name: "Hazel" },
									to: invite.to,
									subject,
									text,
									html,
								}),
							catch: (error) => new InviteEmailError({ message: String(error) }),
						})
					}),
				}
			}),
		)

	/** No email service: logs the accept link (Bun, tests, a Worker without the binding). */
	static readonly layerLog = Layer.succeed(InviteMailer, {
		send: (invite) =>
			Effect.logInfo("[invite] email sending is not configured; share this link", {
				to: invite.to,
				organization: invite.organizationName,
				acceptUrl: invite.acceptUrl,
			}),
	})
}
