// @vitest-environment jsdom
import { Command, expectOutMessage, given, message, model, story } from "foldkit/story"
import { describe, expect, test } from "vitest"
import {
	CloseDialog,
	close,
	init,
	initOpen,
	isCloseRequest,
	isReady,
	Message,
	OutMessage,
	open,
	ShowDialog,
	update,
} from "./modal"

/** Modal on @foldkit/ui Dialog: opening shows the native dialog, closing closes it, both announced. */

describe("modal story", () => {
	test("a new modal starts closed; initOpen is the open Model", () => {
		expect(init("rename").isOpen).toBe(false)
		expect(initOpen("rename").isOpen).toBe(true)
	})

	test("a request to open shows the dialog and emits Opened", () => {
		story(
			update,
			given(init("rename")),
			message(Message.RequestedOpen()),
			expectOutMessage(OutMessage.Opened()),
			Command.resolve(ShowDialog, Message.SucceededShowDialog()),
			model((next) => expect(next.isOpen).toBe(true)),
		)
	})

	test("a request to close closes the dialog and emits Closed", () => {
		story(
			update,
			given(initOpen("rename")),
			message(Message.RequestedClose()),
			expectOutMessage(OutMessage.Closed()),
			Command.resolve(CloseDialog, Message.CompletedCloseDialog()),
			model((next) => expect(next.isOpen).toBe(false)),
		)
	})

	test("open and close from the parent match the Messages", () => {
		expect(open(init("rename")).model.isOpen).toBe(true)
		expect(close(initOpen("rename")).model.isOpen).toBe(false)
		expect(close(initOpen("rename")).outMessage).toEqual(OutMessage.Closed())
	})

	test("isCloseRequest and isReady name the Messages parents react to", () => {
		expect(isCloseRequest(Message.RequestedClose())).toBe(true)
		expect(isCloseRequest(Message.SucceededAcquireResources())).toBe(false)
		expect(isReady(Message.SucceededAcquireResources())).toBe(true)
		expect(isReady(Message.RequestedClose())).toBe(false)
	})
})
