"use client"

import { useAtomSet } from "@effect/atom-react"
import { useNavigate } from "@tanstack/react-router"
import { type } from "arktype"
import IconHashtag from "~/components/icons/icon-hashtag"
import IconLock from "~/components/icons/icon-lock"
import { Button } from "~/components/ui/button"
import {
	CommandMenuFormBody,
	CommandMenuFormContainer,
	CommandMenuFormField,
	CommandMenuFormFooter,
	CommandMenuFormHeader,
	CommandMenuInput,
	CommandMenuToggle,
} from "~/components/ui/command-menu-form"
import { createChannelAction } from "~/db/actions"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import { exitToastAsync } from "~/lib/toast-exit"
import { useCommandPaletteContext } from "../command-palette-context"

const channelSchema = type({
	name: "string > 2",
	type: "'public'|'private'",
})

interface CreateChannelViewProps {
	onClose: () => void
	onBack: () => void
}

export function CreateChannelView({ onClose, onBack }: CreateChannelViewProps) {
	const { user } = useAuth()
	const { organizationId, slug } = useOrganization()
	const navigate = useNavigate()
	const { currentPage, updateCreateChannelState } = useCommandPaletteContext()

	const createChannel = useAtomSet(createChannelAction, {
		mode: "promiseExit",
	})

	// Type guard to ensure we're on the create-channel page
	if (currentPage.type !== "create-channel") {
		return null
	}

	const { name, channelType, error, isSubmitting } = currentPage

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Validate
		const result = channelSchema({ name, type: channelType })
		if (result instanceof type.errors) {
			updateCreateChannelState(() => ({ error: "Channel name must be at least 3 characters" }))
			return
		}

		if (!user?.id || !organizationId || !slug) return

		updateCreateChannelState(() => ({ isSubmitting: true, error: null }))

		await exitToastAsync(
			createChannel({
				name,
				icon: null,
				type: channelType,
				organizationId,
				parentChannelId: null,
				currentUserId: user.id,
			}),
		)
			.loading("Creating channel...")
			.onSuccess((result) => {
				navigate({
					to: "/$orgSlug/chat/$id",
					params: {
						orgSlug: slug,
						id: result.data.channelId,
					},
				})
				onClose()
			})
			.successMessage("Channel created successfully")
			.run()

		updateCreateChannelState(() => ({ isSubmitting: false }))
	}

	return (
		<CommandMenuFormContainer>
			<CommandMenuFormHeader
				title="Create Channel"
				subtitle="Create a new channel for your team"
				onBack={onBack}
			/>
			<form onSubmit={handleSubmit}>
				<CommandMenuFormBody className="space-y-4">
					<CommandMenuFormField label="Channel name" error={error || undefined}>
						<CommandMenuInput
							placeholder="e.g. general, design, marketing"
							value={name}
							onChange={(e) => {
								updateCreateChannelState(() => ({
									name: e.target.value,
									error: null,
								}))
							}}
							autoFocus
						/>
					</CommandMenuFormField>

					<CommandMenuFormField label="Channel type">
						<CommandMenuToggle
							value={channelType}
							onChange={(v) =>
								updateCreateChannelState(() => ({
									channelType: v as "public" | "private",
								}))
							}
							options={[
								{
									value: "public",
									label: "Public",
									icon: <IconHashtag className="size-4" />,
								},
								{
									value: "private",
									label: "Private",
									icon: <IconLock className="size-4" />,
								},
							]}
						/>
					</CommandMenuFormField>
				</CommandMenuFormBody>

				<CommandMenuFormFooter>
					<span>
						<kbd>Tab</kbd> to switch fields
					</span>
					<Button
						size="xs"
						intent="primary"
						type="submit"
						isDisabled={!name.trim() || isSubmitting}
					>
						{isSubmitting ? "Creating..." : "Create"}
						{!isSubmitting && <kbd>↵</kbd>}
					</Button>
				</CommandMenuFormFooter>
			</form>
		</CommandMenuFormContainer>
	)
}
