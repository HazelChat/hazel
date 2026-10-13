// @vitest-environment jsdom
import { Command, expectOutMessage, given, message, story } from "foldkit/story"
import { describe, expect, test } from "vitest"
import { currentUser, makeShared, organizationId, storyUpdate } from "../../test/pages-fixtures"
import { PageOutMessage } from "../out-message"
import { init, TakeReturnTo, update } from "./index"
import { Message } from "./model"

/** `/` forwards once the user, their membership and the page sign-in started from are known. */

const membership = { organizationId, slug: "hazel" }
const signedIn = storyUpdate(update, makeShared())
const notOnboarded = storyUpdate(update, makeShared({ currentUser: { ...currentUser, isOnboarded: false } }))
const go = (href: string) => expectOutMessage(PageOutMessage.RequestedNavigation({ href, replace: true }))

describe("root redirect", () => {
	test("reads the remembered page first", () => {
		expect(init().commands?.map((command) => command.name)).toEqual([TakeReturnTo.name])
	})

	test("without a remembered page it goes to the user's organization", () => {
		story(
			signedIn,
			given(init().model),
			message(Message.UpdatedMembership({ membership })),
			Command.expectNone(),
			message(Message.TookReturnTo({ returnTo: null })),
			go("/hazel"),
		)
	})

	test("back to the page sign-in started from", () => {
		story(
			signedIn,
			given(init().model),
			message(Message.TookReturnTo({ returnTo: "/join/acme" })),
			message(Message.UpdatedMembership({ membership: null })),
			go("/join/acme"),
		)
	})

	test("onboarding comes before the remembered page", () => {
		story(
			notOnboarded,
			given(init().model),
			message(Message.TookReturnTo({ returnTo: "/join/acme" })),
			message(Message.UpdatedMembership({ membership: null })),
			go("/onboarding"),
		)
	})
})
