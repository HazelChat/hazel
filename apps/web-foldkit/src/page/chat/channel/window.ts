import { modifyFields } from "foldkit/struct"
import * as MessageList from "../../../mount/message-list"
import { PAGE_SIZE } from "../queries"
import type { Model, PageReturn } from "./model"

/** The loaded message window: how far it reaches back, and paging at its edges (read and write path). */

/** The most messages the window holds (S2 condition 1); past it, older pages slide the window. */
export const MAX_WINDOW = 10 * PAGE_SIZE

/** Only a window that reaches the newest message follows the end. */
const withWindowFollow = (model: Model): Model => {
	const list = MessageList.setCanFollowEnd(model.list, model.offset === 0)
	return list === model.list ? model : modifyFields(model, { list: () => list })
}

/**
 * Grows the window by a page near the oldest message, then slides it; near the end it slides back.
 * Only while the list is on screen: a hidden list's offsets describe no reader.
 */
export const loadWhenNearEdge = (result: PageReturn): PageReturn => {
	const { model } = result
	if (model.tab._tag !== "Messages") return result
	const isPageFull = model.messages.length >= model.limit
	if (isPageFull && MessageList.isNearStart(model.list)) {
		const next =
			model.limit < MAX_WINDOW
				? modifyFields(model, { limit: (limit) => limit + PAGE_SIZE })
				: modifyFields(model, { offset: (offset) => offset + PAGE_SIZE })
		return { ...result, model: withWindowFollow(next) }
	}
	if (model.offset > 0 && MessageList.isNearEnd(model.list))
		return {
			...result,
			model: withWindowFollow(
				modifyFields(model, { offset: (offset) => Math.max(0, offset - PAGE_SIZE) }),
			),
		}
	return result
}

/** Back to the newest page (after sending from a scrolled-back window). */
export const resetWindow = (model: Model): Model =>
	model.offset === 0
		? model
		: withWindowFollow(modifyFields(model, { offset: () => 0, limit: () => PAGE_SIZE }))
