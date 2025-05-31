import { createForm } from "@tanstack/solid-form"
import { useNavigate } from "@tanstack/solid-router"
import { type } from "arktype"
import { api } from "convex-hazel/_generated/api"
import type { Id } from "convex-hazel/_generated/dataModel"
import type { Accessor } from "solid-js"
import { Button } from "~/components/ui/button"
import { SelectNative } from "~/components/ui/select-native"
import { TextField } from "~/components/ui/text-field"
import { createMutation } from "~/lib/convex"

export interface CreateChannelFormProps {
	serverId: Accessor<string>
	onSuccess?: () => void
}

export const CreateChannelForm = (props: CreateChannelFormProps) => {
	const navigate = useNavigate()

	const createChannel = createMutation(api.channels.createChannel)

	const form = createForm(() => ({
		defaultValues: {
			channelType: "public",
			name: "",
		},
		validators: {
			onSubmit: type({
				name: "3 <= string <= 15",
				channelType: "'public' | 'private'",
			}),
		},
		onSubmit: async ({ value, formApi }) => {
			const channelId = await createChannel({
				serverId: props.serverId() as Id<"servers">,
				name: value.name,
				type: value.channelType as "public" | "private",
			})

			formApi.reset()
			props.onSuccess?.()

			navigate({ to: "/$serverId/chat/$id", params: { id: channelId, serverId: props.serverId() } })
		},
	}))

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				e.stopPropagation()
				form.handleSubmit()
			}}
			class="flex flex-col gap-2"
		>
			<form.Field
				name="name"
				children={(field) => (
					<TextField
						label="Channel Name"
						name={field().name}
						value={field().state.value}
						onBlur={field().handleBlur}
						onInput={(e) => field().handleChange(e.target.value)}
						isInvalid={field().state.meta.errors.length > 0}
						errorText={field().state.meta.errors.join(", ")}
					/>
				)}
			/>
			<form.Field
				name="channelType"
				children={(field) => (
					<SelectNative
						label="Channel Type"
						name={field().name}
						value={field().state.value}
						onBlur={field().handleBlur}
						onInput={(e) => field().handleChange(e.target.value)}
						isInvalid={field().state.meta.errors.length > 0}
						errorText={field().state.meta.errors.join(", ")}
					>
						<option value="public">Public</option>
						<option value="private">Private</option>
					</SelectNative>
				)}
			/>

			<Button type="submit">Create Channel</Button>
		</form>
	)
}
