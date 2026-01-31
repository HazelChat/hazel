import { useAtomValue, useAtomSet } from "@effect-atom/atom-react"
import { useState } from "react"
import type { UserCredentialId } from "@hazel/schema"
import { Button } from "~/components/ui/button"
import {
	ModalContent,
	ModalBody,
	ModalClose,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "~/components/ui/modal"
import { TextField } from "~/components/ui/text-field"
import { Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { IconCheck } from "~/components/icons/icon-check"
import { IconKey } from "~/components/icons/icon-key"
import { IconLoader } from "~/components/icons/icon-loader"
import { IconPlus } from "~/components/icons/icon-plus"
import { IconTrash } from "~/components/icons/icon-trash"
import {
	CREDENTIAL_PROVIDERS,
	deleteCredentialMutation,
	storeCredentialMutation,
	type CredentialData,
	type CredentialProviderId,
} from "~/atoms/credential-atoms"
import { exitToastAsync } from "~/lib/toast-exit"

interface CredentialSetupDialogProps {
	isOpen: boolean
	onOpenChange: (isOpen: boolean) => void
}

export function CredentialSetupDialog({ isOpen, onOpenChange }: CredentialSetupDialogProps) {
	const [selectedProvider, setSelectedProvider] = useState<CredentialProviderId | null>(null)
	const [apiKey, setApiKey] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const storeCredential = useAtomSet(storeCredentialMutation, { mode: "promiseExit" })
	const deleteCredential = useAtomSet(deleteCredentialMutation, { mode: "promiseExit" })

	// In a real implementation, we'd use a query atom here
	const [credentials, setCredentials] = useState<CredentialData[]>([])

	const handleStoreCredential = async () => {
		if (!selectedProvider || !apiKey.trim()) return

		setIsSubmitting(true)
		try {
			await exitToastAsync(
				storeCredential({ payload: { provider: selectedProvider, apiKey: apiKey.trim() } }),
			)
				.loading("Storing credential...")
				.successMessage("Credential stored securely")
				.onErrorTag("CredentialAlreadyExistsError", () => ({
					title: "Credential exists",
					description:
						"You already have a credential for this provider. Delete it first to add a new one.",
					isRetryable: false,
				}))
				.run()

			setApiKey("")
			setSelectedProvider(null)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDeleteCredential = async (credentialId: UserCredentialId) => {
		await exitToastAsync(deleteCredential({ payload: { id: credentialId } }))
			.loading("Deleting credential...")
			.successMessage("Credential deleted")
			.onErrorTag("CredentialIdNotFoundError", () => ({
				title: "Credential not found",
				description: "This credential may have already been deleted.",
				isRetryable: false,
			}))
			.run()
	}

	const configuredProviders = new Set(credentials.map((c) => c.provider))

	return (
		<ModalContent isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
			<ModalHeader>
				<ModalTitle>API Credentials</ModalTitle>
				<ModalDescription>
					Configure your API keys for AI agents and sandbox providers. Keys are encrypted and stored
					securely.
				</ModalDescription>
			</ModalHeader>

			<ModalBody className="space-y-6">
				{/* Configured credentials */}
				{credentials.length > 0 && (
					<div className="space-y-3">
						<h3 className="text-sm font-medium text-muted-fg">Configured</h3>
						<div className="space-y-2">
							{credentials.map((credential) => {
								const providerInfo = CREDENTIAL_PROVIDERS.find(
									(p) => p.id === credential.provider,
								)
								return (
									<div
										key={credential.id}
										className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3"
									>
										<div className="flex items-center gap-3">
											<div className="flex size-8 items-center justify-center rounded-md bg-success/20">
												<IconCheck className="size-4 fill-success" />
											</div>
											<div>
												<p className="text-sm font-medium">{providerInfo?.name}</p>
												<p className="text-xs text-muted-fg">
													{credential.keyHint || "Configured"}
												</p>
											</div>
										</div>
										<Button
											intent="plain"
											size="sq-sm"
											onPress={() => handleDeleteCredential(credential.id)}
										>
											<IconTrash className="size-4 fill-danger" />
										</Button>
									</div>
								)
							})}
						</div>
					</div>
				)}

				{/* Add new credential */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-muted-fg">Add Credential</h3>

					{/* Provider selection */}
					<div className="grid grid-cols-2 gap-2">
						{CREDENTIAL_PROVIDERS.map((provider) => {
							const isConfigured = configuredProviders.has(provider.id)
							const isSelected = selectedProvider === provider.id

							return (
								<button
									key={provider.id}
									type="button"
									disabled={isConfigured}
									onClick={() => setSelectedProvider(provider.id)}
									className={`flex flex-col items-start rounded-lg border p-3 text-left transition-colors ${
										isConfigured
											? "cursor-not-allowed border-border bg-secondary/30 opacity-50"
											: isSelected
												? "border-primary bg-primary/10"
												: "border-border hover:border-primary/50 hover:bg-secondary"
									}`}
								>
									<div className="flex w-full items-center justify-between">
										<span className="text-sm font-medium">{provider.name}</span>
										{isConfigured && <IconCheck className="size-4 fill-success" />}
									</div>
									<span className="text-xs text-muted-fg">{provider.description}</span>
								</button>
							)
						})}
					</div>

					{/* API key input */}
					{selectedProvider && (
						<div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
							<TextField>
								<Label>
									{CREDENTIAL_PROVIDERS.find((p) => p.id === selectedProvider)?.name} API
									Key
								</Label>
								<Input
									type="password"
									placeholder="sk-..."
									value={apiKey}
									onChange={(e) => setApiKey(e.target.value)}
								/>
							</TextField>
							<div className="flex justify-end gap-2">
								<Button intent="plain" size="sm" onPress={() => setSelectedProvider(null)}>
									Cancel
								</Button>
								<Button
									intent="primary"
									size="sm"
									isDisabled={!apiKey.trim() || isSubmitting}
									onPress={handleStoreCredential}
								>
									{isSubmitting ? (
										<IconLoader className="size-4 animate-spin" />
									) : (
										<IconPlus className="size-4" />
									)}
									Store Key
								</Button>
							</div>
						</div>
					)}
				</div>
			</ModalBody>

			<ModalFooter>
				<ModalClose>Done</ModalClose>
			</ModalFooter>
		</ModalContent>
	)
}
