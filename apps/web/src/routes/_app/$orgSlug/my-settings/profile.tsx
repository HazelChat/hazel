import { useAtomSet } from "@effect-atom/atom-react"
import type { UserId } from "@hazel/schema"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { type } from "arktype"
import { Exit } from "effect"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import IconEnvelope from "~/components/icons/icon-envelope"
import { ProfilePictureUpload } from "~/components/profile/profile-picture-upload"
import { Button } from "~/components/ui/button"
import { FieldError, Label } from "~/components/ui/field"
import { Input, InputGroup } from "~/components/ui/input"
import { SectionHeader } from "~/components/ui/section-header"
import { SectionLabel } from "~/components/ui/section-label"
import { TextField } from "~/components/ui/text-field"
import { TimezoneSelect } from "~/components/ui/timezone-select"
import { useUserIntegrationConnection } from "~/db/hooks"
import { updateUserAction } from "~/db/actions"
import { useAppForm } from "~/hooks/use-app-form"
import { useAuth } from "~/lib/auth"
import { HazelApiClient } from "~/lib/services/common/atom-client"
import { detectBrowserTimezone } from "~/utils/timezone"

interface ProfileSearchParams {
	connection_status?: "success" | "error"
	error_code?: string
	provider?: string
}

export const Route = createFileRoute("/_app/$orgSlug/my-settings/profile")({
	component: ProfileSettings,
	validateSearch: (search: Record<string, unknown>): ProfileSearchParams => ({
		connection_status: search.connection_status as ProfileSearchParams["connection_status"],
		error_code: search.error_code as string | undefined,
		provider: search.provider as string | undefined,
	}),
})

const profileSchema = type({
	firstName: "string > 0",
	lastName: "string > 0",
	timezone: "string | null",
})

type ProfileFormData = typeof profileSchema.infer

function ProfileSettings() {
	const { orgSlug } = Route.useParams()
	const { connection_status, error_code, provider } = Route.useSearch()
	const navigate = useNavigate()
	const { user } = useAuth()
	const [isConnectingDiscord, setIsConnectingDiscord] = useState(false)
	const [isDisconnectingDiscord, setIsDisconnectingDiscord] = useState(false)
	const updateUserMutation = useAtomSet(updateUserAction, { mode: "promiseExit" })
	const getOAuthUrlMutation = useAtomSet(HazelApiClient.mutation("integrations", "getOAuthUrl"), {
		mode: "promiseExit",
	})
	const disconnectMutation = useAtomSet(HazelApiClient.mutation("integrations", "disconnect"), {
		mode: "promiseExit",
	})

	const { connection: discordConnection, isConnected: isDiscordConnected } = useUserIntegrationConnection(
		user?.organizationId ?? null,
		user?.id as UserId | undefined,
		"discord",
	)

	useEffect(() => {
		if (!connection_status || provider !== "discord") return

		if (connection_status === "success") {
			toast.success("Discord account linked")
		} else {
			toast.error("Failed to link Discord account", {
				description: error_code ?? "Please try again.",
			})
		}

		navigate({
			to: "/$orgSlug/my-settings/profile",
			params: { orgSlug },
			search: {},
			replace: true,
		})
	}, [connection_status, provider, error_code, navigate, orgSlug])

	const handleConnectDiscord = async () => {
		if (!user?.organizationId) return
		setIsConnectingDiscord(true)
		const result = await getOAuthUrlMutation({
			path: { orgId: user.organizationId, provider: "discord" },
			urlParams: { level: "user" },
		})

		if (Exit.isSuccess(result)) {
			window.location.href = result.value.authorizationUrl
			return
		}

		setIsConnectingDiscord(false)
		toast.error("Failed to start Discord linking flow")
	}

	const handleDisconnectDiscord = async () => {
		if (!user?.organizationId) return
		setIsDisconnectingDiscord(true)
		const result = await disconnectMutation({
			path: { orgId: user.organizationId, provider: "discord" },
			urlParams: { level: "user" },
		})

		if (Exit.isSuccess(result)) {
			toast.success("Discord account unlinked")
		} else {
			toast.error("Failed to unlink Discord account")
		}

		setIsDisconnectingDiscord(false)
	}

	// Use browser timezone as default if user hasn't set one
	const defaultTimezone = user?.timezone || detectBrowserTimezone()

	const form = useAppForm({
		defaultValues: {
			firstName: user?.firstName || "",
			lastName: user?.lastName || "",
			timezone: defaultTimezone,
		} as ProfileFormData,
		validators: {
			onChange: profileSchema,
		},
		onSubmit: async ({ value }) => {
			if (!user) return
			const result = await updateUserMutation({
				userId: user.id as UserId,
				firstName: value.firstName,
				lastName: value.lastName,
				timezone: value.timezone,
			})

			if (Exit.isSuccess(result)) {
				toast.success("Profile updated successfully")
			} else {
				console.error(result.cause)
				toast.error("Failed to update profile")
			}
		},
	})

	return (
		<form
			key={user?.id}
			className="flex flex-col gap-6 px-4 lg:px-8"
			onSubmit={(e) => {
				e.preventDefault()
				form.handleSubmit()
			}}
		>
			<SectionHeader.Root>
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-0.5 self-stretch">
						<SectionHeader.Heading>Profile</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Manage your profile information and preferences.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			<div className="max-w-xl space-y-6">
				<div className="space-y-2">
					<SectionLabel.Root size="sm" title="Profile picture" className="max-lg:hidden" />
					<ProfilePictureUpload
						currentAvatarUrl={user?.avatarUrl}
						userId={user?.id || ""}
						userInitials={`${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`}
						showReset
					/>
				</div>

				<div className="space-y-2">
					<SectionLabel.Root isRequired size="sm" title="Name" className="max-lg:hidden" />

					<div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-4">
						<form.AppField
							name="firstName"
							children={(field) => (
								<field.TextField
									isRequired
									name="firstName"
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									onBlur={field.handleBlur}
									isInvalid={!!field.state.meta.errors?.length}
								>
									<Label className="lg:hidden">First name</Label>
									<Input />
									{field.state.meta.errors?.length > 0 && (
										<FieldError>
											{field.state.meta.errors[0]?.message || "First name is required"}
										</FieldError>
									)}
								</field.TextField>
							)}
						/>
						<form.AppField
							name="lastName"
							children={(field) => (
								<field.TextField
									isRequired
									name="lastName"
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									onBlur={field.handleBlur}
									isInvalid={!!field.state.meta.errors?.length}
								>
									<Label className="lg:hidden">Last name</Label>
									<Input />
									{field.state.meta.errors?.length > 0 && (
										<FieldError>
											{field.state.meta.errors[0]?.message || "Last name is required"}
										</FieldError>
									)}
								</field.TextField>
							)}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<SectionLabel.Root size="sm" title="Email address" className="max-lg:hidden" />

					<TextField isDisabled>
						<Label className="lg:hidden">Email address</Label>
						<InputGroup>
							<IconEnvelope data-slot="icon" />
							<Input type="email" value={user?.email} />
						</InputGroup>
					</TextField>
				</div>

				<div className="space-y-2">
					<SectionLabel.Root size="sm" title="Timezone" className="max-lg:hidden" />
					<Label className="lg:hidden">Timezone</Label>
					<form.AppField
						name="timezone"
						children={(field) => (
							<TimezoneSelect
								value={field.state.value}
								onChange={(tz) => field.handleChange(tz)}
							/>
						)}
					/>
				</div>

				<div className="space-y-2">
					<SectionLabel.Root size="sm" title="Discord Sync Identity" className="max-lg:hidden" />
					<div className="rounded-xl border border-border bg-bg p-4">
						<div className="mb-3">
							<p className="font-medium text-sm text-fg">
								{isDiscordConnected ? "Discord account linked" : "Link Discord account"}
							</p>
							<p className="text-muted-fg text-xs">
								{isDiscordConnected
									? `Messages synced from Discord can map to your Hazel user (${discordConnection?.externalAccountName ?? "Discord account"}).`
									: "Link your Discord account to map synced Discord messages to your Hazel user."}
							</p>
						</div>
						{isDiscordConnected ? (
							<Button
								intent="danger"
								size="sm"
								onPress={handleDisconnectDiscord}
								isDisabled={isDisconnectingDiscord}
							>
								{isDisconnectingDiscord ? "Unlinking..." : "Unlink Discord"}
							</Button>
						) : (
							<Button
								intent="primary"
								size="sm"
								onPress={handleConnectDiscord}
								isDisabled={isConnectingDiscord}
							>
								{isConnectingDiscord ? "Redirecting..." : "Link Discord"}
							</Button>
						)}
					</div>
				</div>

				<div className="flex justify-end">
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}
					>
						{([canSubmit, isSubmitting, isDirty]) => (
							<Button
								type="submit"
								intent="primary"
								isDisabled={!canSubmit || isSubmitting || !isDirty}
							>
								{isSubmitting ? "Saving..." : "Save"}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</div>
		</form>
	)
}
