// @vitest-environment jsdom
import { Option } from "effect"
import { NotValidated } from "foldkit/fieldValidation"
import { Command, given, message, model, story } from "foldkit/story"
import { describe, expect, test } from "vitest"
import { makeShared, organizationId, storyUpdate } from "../../../../test/pages-fixtures"
import { ConnectApiKey, Disconnect, GetOAuthUrl } from "./command"
import { Message } from "./message"
import { Activity } from "./model"
import { init, update } from "./update"

/** The integration detail update: organization gating, config toggles and request guards. */

const shared = makeShared()
const run = storyUpdate(update, shared)
const pageFor = (integrationId: string) =>
	init({
		_tag: "SettingsIntegration",
		orgSlug: "hazel",
		integrationId,
		connectionStatus: Option.none(),
		errorCode: Option.none(),
	}).model
const linear = pageFor("linear")

describe("integration detail update", () => {
	test("nothing is requested while the organization is unknown, or for an unknown provider", () => {
		const signedOut = storyUpdate(update, makeShared({ organization: null }))
		story(
			signedOut,
			given(linear),
			message(Message.ClickedConnect()),
			message(Message.ClickedDisconnect()),
			Command.expectNone(),
		)
		story(run, given(pageFor("figma-nope")), message(Message.ClickedConnect()), Command.expectNone())
	})

	test("config toggles add and remove their option", () => {
		story(
			run,
			given(linear),
			message(Message.ToggledConfigOption({ optionId: "auto-link", isSelected: true })),
			message(Message.ToggledConfigOption({ optionId: "notifications", isSelected: true })),
			message(Message.ToggledConfigOption({ optionId: "auto-link", isSelected: false })),
			model((current) => expect(current.enabledOptionIds).toEqual(["notifications"])),
		)
	})

	test("submitting an untouched API key form sends nothing and shows why", () => {
		story(
			run,
			given(pageFor("craft")),
			message(Message.SubmittedApiKeyForm()),
			Command.expectNone(),
			model((current) => {
				expect(current.activity).toEqual(Activity.Idle())
				expect(current.apiToken).toEqual({
					_tag: "Invalid",
					value: "",
					errors: ["Bearer token is required"],
				})
				expect(current.apiBaseUrl).toEqual({
					_tag: "Invalid",
					value: "",
					errors: ["Base URL is required"],
				})
			}),
		)
	})

	test("a blank token or a base URL that is not a URL sends nothing", () => {
		story(
			run,
			given({
				...pageFor("craft"),
				apiToken: NotValidated({ value: "secret" }),
				apiBaseUrl: NotValidated({ value: "   " }),
			}),
			message(Message.SubmittedApiKeyForm()),
			Command.expectNone(),
			message(Message.ChangedApiBaseUrl({ value: "craft.test/api" })),
			message(Message.SubmittedApiKeyForm()),
			Command.expectNone(),
			model((current) =>
				expect(current.apiBaseUrl).toEqual({
					_tag: "Invalid",
					value: "craft.test/api",
					errors: ["Enter a full URL starting with https://"],
				}),
			),
			message(Message.ChangedApiToken({ value: "  " })),
			model((current) => expect(current.apiToken._tag).toBe("Invalid")),
		)
	})

	test("a second Connect while connecting sends nothing", () => {
		story(
			run,
			given(linear),
			message(Message.ClickedConnect()),
			Command.resolve(GetOAuthUrl, Message.FailedGetOAuthUrl({ reason: "Offline" })),
		)
		expect(
			update({ ...linear, activity: Activity.Connecting() }, Message.ClickedConnect(), shared)
				.commands ?? [],
		).toHaveLength(0)
	})

	test("a second Disconnect while disconnecting sends nothing", () => {
		story(
			run,
			given(linear),
			message(Message.ClickedDisconnect()),
			Command.resolve(Disconnect, Message.SucceededDisconnect()),
		)
		expect(
			update({ ...linear, activity: Activity.Disconnecting() }, Message.ClickedDisconnect(), shared)
				.commands ?? [],
		).toHaveLength(0)
	})

	test("a second API key submit while connecting sends nothing", () => {
		const filled = {
			...pageFor("craft"),
			apiToken: NotValidated({ value: "secret" }),
			apiBaseUrl: NotValidated({ value: " https://craft.test/api " }),
		}
		story(
			run,
			given(filled),
			message(Message.SubmittedApiKeyForm()),
			Command.expectExact(
				ConnectApiKey({
					orgId: organizationId,
					provider: "craft",
					token: "secret",
					baseUrl: "https://craft.test/api",
				}),
			),
			Command.resolve(ConnectApiKey, Message.SucceededConnectApiKey({ externalAccountName: null })),
		)
		expect(
			update({ ...filled, activity: Activity.Connecting() }, Message.SubmittedApiKeyForm(), shared)
				.commands ?? [],
		).toHaveLength(0)
	})
})
