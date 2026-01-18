import { useAtomSet } from "@effect-atom/atom-react"
import type { BotScope } from "@hazel/domain/rpc"
import { type } from "arktype"
import { useEffect } from "react"
import { updateBotMutation } from "~/atoms/bot-atoms"
import { BotAvatarUpload } from "~/components/bots/bot-avatar-upload"
import type { BotWithUser } from "~/db/hooks"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Description, FieldError, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "~/components/ui/modal"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { TextField } from "~/components/ui/text-field"
import { useAppForm } from "~/hooks/use-app-form"
import { BOT_SCOPES } from "~/lib/bot-scopes"
import { toastExit } from "~/lib/toast-exit"

const botSchema = type({
	name: "1<string<101",
	"description?": "string",
	"webhookUrl?": "string",
	scopes: "string[]",
	isPublic: "boolean",
})

interface EditBotModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	bot: BotWithUser
	onSuccess?: () => void
	reactivityKeys?: readonly string[]
}

export function EditBotModal({ isOpen, onOpenChange, bot, onSuccess, reactivityKeys }: EditBotModalProps) {
	const updateBot = useAtomSet(updateBotMutation, { mode: "promiseExit" })

	const form = useAppForm({
		defaultValues: {
			name: bot.name,
			description: bot.description ?? "",
			webhookUrl: bot.webhookUrl ?? "",
			scopes: (bot.scopes ?? []) as string[],
			isPublic: bot.isPublic ?? false,
		},
		validators: {
			onChange: botSchema,
		},
		onSubmit: async ({ value }) => {
			if (value.scopes.length === 0) {
				return
			}

			await toastExit(
				updateBot({
					payload: {
						id: bot.id,
						name: value.name,
						description: value.description || null,
						webhookUrl: value.webhookUrl || null,
						scopes: value.scopes as BotScope[],
						isPublic: value.isPublic,
					},
					reactivityKeys,
				}),
				{
					loading: "Updating application...",
					success: () => {
						onOpenChange(false)
						onSuccess?.()
						return `Application "${value.name}" updated successfully`
					},
					customErrors: {
						BotNotFoundError: () => ({
							title: "Application not found",
							description: "This application may have been deleted.",
							isRetryable: false,
						}),
					},
				},
			)
		},
	})

	// Reset form when modal opens with a different bot
	useEffect(() => {
		if (isOpen) {
			form.reset({
				name: bot.name,
				description: bot.description ?? "",
				webhookUrl: bot.webhookUrl ?? "",
				scopes: (bot.scopes ?? []) as string[],
				isPublic: bot.isPublic ?? false,
			})
		}
	}, [isOpen, bot.id])

	const toggleScope = (scopeId: string, currentScopes: string[]) => {
		if (currentScopes.includes(scopeId)) {
			return currentScopes.filter((s) => s !== scopeId)
		}
		return [...currentScopes, scopeId]
	}

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="lg">
				<ModalHeader>
					<ModalTitle>Edit Application</ModalTitle>
					<ModalDescription>Update your application settings and permissions</ModalDescription>
				</ModalHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					<ModalBody className="flex flex-col gap-6">
						{/* Avatar Upload */}
						<div className="flex justify-center">
							<BotAvatarUpload bot={bot} />
						</div>

						{/* Basic Info */}
						<form.AppField
							name="name"
							children={(field) => (
								<TextField>
									<Label>Name</Label>
									<Input
										placeholder="My Bot"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										aria-invalid={!!field.state.meta.errors?.length}
									/>
									{field.state.meta.errors?.[0] && (
										<FieldError>{field.state.meta.errors[0].message}</FieldError>
									)}
								</TextField>
							)}
						/>

						<form.AppField
							name="description"
							children={(field) => (
								<TextField>
									<Label>Description</Label>
									<Description>Describe what this bot does</Description>
									<Textarea
										placeholder="This bot helps with..."
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										rows={2}
									/>
								</TextField>
							)}
						/>

						{/* Scopes Selection */}
						<div className="flex flex-col gap-3">
							<div>
								<Label>Permissions</Label>
								<Description>Select what this bot can access</Description>
							</div>

							<form.AppField
								name="scopes"
								children={(field) => (
									<>
										<div className="grid gap-2 sm:grid-cols-2">
											{BOT_SCOPES.map((scope) => (
												<label
													key={scope.id}
													className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
												>
													<Checkbox
														isSelected={field.state.value.includes(scope.id)}
														onChange={() => {
															field.handleChange(
																toggleScope(scope.id, field.state.value),
															)
														}}
													/>
													<div className="flex flex-col gap-0.5">
														<span className="font-medium text-fg text-sm">
															{scope.label}
														</span>
														<span className="text-muted-fg text-xs">
															{scope.description}
														</span>
													</div>
												</label>
											))}
										</div>
										{field.state.value.length === 0 && (
											<FieldError>Select at least one permission</FieldError>
										)}
									</>
								)}
							/>
						</div>

						{/* Advanced Options */}
						<div className="flex flex-col gap-4 border-border border-t pt-4">
							<div className="font-medium text-fg text-sm">Advanced</div>

							<form.AppField
								name="webhookUrl"
								children={(field) => (
									<TextField>
										<Label>Webhook URL (Optional)</Label>
										<Description>URL to receive bot events</Description>
										<Input
											placeholder="https://example.com/webhook"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
										/>
									</TextField>
								)}
							/>

							<form.AppField
								name="isPublic"
								children={(field) => (
									<div className="flex items-center justify-between gap-4">
										<div className="flex flex-col gap-0.5">
											<Label className="font-medium">List in Marketplace</Label>
											<Description>
												Allow other workspaces to discover and install this
												application
											</Description>
										</div>
										<Switch
											isSelected={field.state.value}
											onChange={field.handleChange}
										/>
									</div>
								)}
							/>
						</div>
					</ModalBody>

					<ModalFooter>
						<Button intent="outline" onPress={() => onOpenChange(false)} type="button">
							Cancel
						</Button>
						<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
							{([canSubmit, isSubmitting]) => (
								<Button
									intent="primary"
									type="submit"
									isDisabled={!canSubmit || isSubmitting}
								>
									{isSubmitting ? "Saving..." : "Save Changes"}
								</Button>
							)}
						</form.Subscribe>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	)
}
