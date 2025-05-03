import { Button } from "../ui/button"
import { Dialog } from "../ui/dialog"

export function ConfirmDialog(props: {
	open: boolean
	title?: string
	message: string
	onConfirm: () => void
	onCancel: () => void
}) {
	return (
		<Dialog open={props.open}>
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
