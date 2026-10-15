import * as Interaction from "../../../../ui/aria/interaction"
import type { PageSubscriptionInput } from "../../../contract"

/** A page's interaction Submodel (React Aria hover, press, focus state): fold, Subscriptions, wiring. */
export const embedInteraction = <Model extends { readonly interaction: Interaction.Model }, Message>(
	toParentMessage: (message: Interaction.Message) => Message,
) => Interaction.embed<Model, Message, PageSubscriptionInput<Model>>(toParentMessage, (input) => input.model)
