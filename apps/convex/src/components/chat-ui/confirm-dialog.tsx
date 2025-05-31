import { splitProps } from "solid-js"
import { Button } from "../ui/button"
import { Dialog, type DialogProps } from "../ui/dialog"

export function ConfirmDialog(
	allProps: {
		open: boolean
		title?: string
		message: string
		onConfirm: () => void
		onCancel: () => void
	} & DialogProps,
) {
	const [props, rest] = splitProps(allProps, ["open", "title", "message", "onConfirm", "onCancel"])
	return (
		<Dialog open={props.open} {...rest}>
			<Dialog.Content role="alertdialog">
				<Dialog.Header>
					<Dialog.Title>{props.title}</Dialog.Title>
					<Dialog.Description>{props.message}</Dialog.Description>
				</Dialog.Header>
				<Dialog.Footer>
					<Dialog.CloseTrigger onClick={props.onCancel}>Cancel</Dialog.CloseTrigger>
					<Button intent="destructive" onClick={props.onConfirm}>
						Continue
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog>
	)
}
