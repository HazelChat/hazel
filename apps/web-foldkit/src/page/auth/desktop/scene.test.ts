// @vitest-environment jsdom
import { Option } from "effect"
import * as Scene from "foldkit/scene"
import { describe, test } from "vitest"
import { AppRoute } from "../../../route"
import { makeShared, pageScene } from "../../../test/pages-fixtures"
import { AuthorizeAttempt, init, SignInFirst, update, view } from "./index"

/** `/auth/desktop`: the browser confirms the account for the desktop app. */

const attempt = "a".repeat(43)
const route = AppRoute.AuthDesktop({ attempt: Option.some(attempt) })
const signedOut = makeShared({ auth: "SignedOut", currentUser: null, organization: null, member: null })
const described = update(init(route).model, { _tag: "DescribedAttempt", appName: "Hazel Desktop" }).model
const expired = update(init(route).model, {
	_tag: "FailedDescribe",
	message: "This sign-in request has expired.",
}).model

describe("desktop handoff page", () => {
	test("signed in, Continue authorizes the attempt and opens the app", () => {
		Scene.scene(
			pageScene(update, view, makeShared()),
			Scene.given(described),
			Scene.expect(Scene.role("heading", { name: "Continue to Hazel Desktop?" })).toExist(),
			Scene.click(Scene.role("button", { name: "Continue" })),
			Scene.Command.expectExact(AuthorizeAttempt({ attemptId: attempt })),
			Scene.Command.resolve(AuthorizeAttempt, {
				_tag: "AuthorizedAttempt",
				callbackUrl: "com.hazel.app://auth/callback?code=c&state=s",
			}),
			Scene.expect(Scene.role("link", { name: "Open Hazel" })).toHaveAttr(
				"href",
				"com.hazel.app://auth/callback?code=c&state=s",
			),
		)
	})

	test("signed out, it signs in first and comes back to this attempt", () => {
		Scene.scene(
			pageScene(update, view, signedOut),
			Scene.given(described),
			Scene.click(Scene.role("button", { name: "Sign in" })),
			Scene.Command.expectExact(SignInFirst({ returnTo: `/auth/desktop?attempt=${attempt}` })),
			Scene.Command.resolve(SignInFirst, { _tag: "LeftForSignIn" }),
		)
	})

	test("an expired attempt says to start again from the app", () => {
		Scene.scene(
			pageScene(update, view, makeShared()),
			Scene.given(expired),
			Scene.expect(Scene.role("heading", { name: "Couldn't sign in the app" })).toExist(),
			Scene.expect(Scene.role("alert")).toHaveText("This sign-in request has expired."),
		)
	})
})
