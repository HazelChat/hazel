import { useAtomSet } from "@effect-atom/atom-react"
import type { BotScope } from "@hazel/domain/rpc"
import { type } from "arktype"
import { useState } from "react"
import { createBotMutation } from "~/atoms/bot-atoms"
import { BotTokenDisplay } from "~/components/bots/bot-token-display"
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
import { toastExit } from "~/lib/toast-exit"

// Scope definitions for UI
const BOT_SCOPES: Array<{ id: BotScope; label: string; description: string }> = [
	{ id: "messages:read", label: "Read Messages", description: "Read messages in channels" },
	{ id: "messages:write", label: "Send Messages", description: "Send and edit messages" },
	{ id: "channels:read", label: "Read Channels", description: "View channel information" },
	{ id: "channels:write", label: "Manage Channels", description: "Create and modify channels" },
	{ id: "users:read", label: "Read Users", description: "View user profiles" },
	{ id: "reactions:write", label: "Add Reactions", description: "React to messages" },
	{ id: "commands:register", label: "Register Commands", description: "Create slash commands" },
]

const botSchema = type({
	name: "1<string<101",
	"description?": "string",
	"webhookUrl?": "string",
	scopes: "string[]",
	isPublic: "boolean",
})

interface CreateBotModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	onSuccess?: () => void
	reactivityKeys?: readonly string[]
}

export function CreateBotModal({ isOpen, onOpenChange, onSuccess, reactivityKeys }: CreateBotModalProps) {
	const [createdBotToken, setCreatedBotToken] = useState<string | null>(null)
	const [createdBotName, setCreatedBotName] = useState<string>("")

	const createBot = useAtomSet(createBotMutation, { mode: "promiseExit" })

	const form = useAppForm({
		defaultValues: {
			name: "",
			description: "",
			webhookUrl: "",
			scopes: ["messages:read", "messages:write"] as string[],
			isPublic: false,
		},
		validators: {
			onChange: botSchema,
		},
		onSubmit: async ({ value }) => {
			if (value.scopes.length === 0) {
				return
			}

			await toastExit(
				createBot({
					payload: {
						name: value.name,
						description: value.description || undefined,
						webhookUrl: value.webhookUrl || undefined,
						scopes: value.scopes as BotScope[],
						isPublic: value.isPublic,
					},
					reactivityKeys,
				}),
				{
					loading: "Creating application...",
					success: (result) => {
						setCreatedBotToken(result.token)
						setCreatedBotName(value.name)
						return `Application "${value.name}" created successfully`
					},
					customErrors: {},
				},
			)
		},
	})

	const handleClose = () => {
		if (createdBotToken) {
			// Reset state when closing after token display
			setCreatedBotToken(null)
			setCreatedBotName("")
			form.reset()
			onSuccess?.()
		}
		onOpenChange(false)
	}

	const toggleScope = (scopeId: string, currentScopes: string[]) => {
		if (currentScopes.includes(scopeId)) {
			return currentScopes.filter((s) => s !== scopeId)
		}
		return [...currentScopes, scopeId]
	}

	// Show token display after successful creation
	if (createdBotToken) {
		return (
			<Modal isOpen={isOpen} onOpenChange={handleClose}>
				<ModalContent size="lg">
					<ModalHeader>
						<ModalTitle>Application Created Successfully</ModalTitle>
						<ModalDescription>
							Your application "{createdBotName}" has been created. Save the token below - you
							won't be able to see it again.
						</ModalDescription>
					</ModalHeader>
					<ModalBody>
						<BotTokenDisplay token={createdBotToken} />
					</ModalBody>
					<ModalFooter>
						<Button intent="primary" onPress={handleClose}>
							Done
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		)
	}

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="lg">
				<ModalHeader>
					<ModalTitle>Create Application</ModalTitle>
					<ModalDescription>
						Create an application to interact with your workspace programmatically using the SDK
					</ModalDescription>
				</ModalHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					<ModalBody className="flex flex-col gap-6">
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
									{isSubmitting ? "Creating..." : "Create Application"}
								</Button>
							)}
						</form.Subscribe>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	)
}
