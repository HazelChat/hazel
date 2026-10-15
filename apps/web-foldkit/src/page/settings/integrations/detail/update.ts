import { Option, Schema } from "effect"
import { allValid, NotValidated, validate } from "foldkit/fieldValidation"
import { failureMessage } from "~/lib/error-messages"
import { getIntegrationById } from "~/lib/integrations/__data"
import { AppRoute, hrefOf, integrationHref, type RouteOf } from "../../../../route"
import type { PageReturn, Shared } from "../../../contract"
import { PageOutMessage } from "../../../out-message"
import { errorToast, errorToastOf, successToast } from "../../../../data/actions"
import { ConnectApiKey, Disconnect, GetOAuthUrl, isProvider, RedirectToProvider } from "./command"
import { Message } from "./message"
import { Activity, apiBaseUrlRules, apiTokenRules, CallbackStatus, type Model } from "./model"

const callbackStatus = Schema.decodeUnknownOption(CallbackStatus)

type Return = PageReturn<Model, Message>

/** `getErrorMessageFromCode` */
const errorMessageFromCode = (errorCode: string | null): string =>
	errorCode === "token_exchange_failed"
		? "Could not authenticate with the provider. Please try again."
		: errorCode === "account_info_failed"
			? "Could not fetch your account information."
			: errorCode === "db_error"
				? "A database error occurred. Please try again."
				: errorCode === "encryption_error"
					? "A security error occurred. Please try again."
					: errorCode === "invalid_state"
						? "The connection request expired. Please try again."
						: "An unexpected error occurred. Please try again."

type Route = RouteOf<"SettingsIntegration">

export const init = (route: Route): Return =>
	oauthCallback(
		{
			orgSlug: route.orgSlug,
			integrationId: route.integrationId,
			connection: null,
			activity: Activity.Idle(),
			apiToken: NotValidated({ value: "" }),
			apiBaseUrl: NotValidated({ value: "" }),
			enabledOptionIds: [],
		},
		route,
	)

/** Same page, new search: a later callback redirect, or the cleaned URL (nothing to show). */
export const routeChanged = (model: Model, route: Route): Return => oauthCallback(model, route)

const nameOf = (model: Model) => getIntegrationById(model.integrationId)?.name

const UNSUPPORTED_PROVIDER = {
	title: "Unsupported provider",
	description: "This integration provider is not supported.",
}

/** The OAuth callback redirect's `connection_status` and `error_code`: toast and clean the URL. */
const oauthCallback = (model: Model, route: Route): Return => {
	const status = Option.getOrNull(callbackStatus(Option.getOrNull(route.connectionStatus)))
	const name = nameOf(model)
	if (status === null || name === undefined) return { model }
	return {
		model: status === "success" ? { ...model, activity: Activity.Verifying() } : model,
		outMessage: PageOutMessage.RequestedNavigation({
			href: integrationHref(model.orgSlug, model.integrationId),
			replace: true,
			toast:
				status === "success"
					? successToast(`Connected to ${name}`, "Your account has been successfully connected.")
					: errorToast(
							`Failed to connect to ${name}`,
							errorMessageFromCode(Option.getOrNull(route.errorCode)),
						),
		}),
	}
}

/** The org and provider a request targets, or nothing while the organization is unknown. */
const targetOf = (model: Model, shared: Shared) =>
	shared.organization !== null && isProvider(model.integrationId)
		? { orgId: shared.organization.id, provider: model.integrationId }
		: null

const validateApiToken = validate(apiTokenRules)
const validateApiBaseUrl = validate(apiBaseUrlRules)

export const update = (model: Model, message: Message, shared: Shared): Return =>
	Message.match<Return>(message, {
		UpdatedConnection: ({ connection }) => ({
			model: {
				...model,
				connection,
				// Verified: a later disconnect shows Connect again, not "Verifying connection...".
				activity:
					model.activity._tag === "Verifying" && connection?.isActive === true
						? Activity.Idle()
						: model.activity,
			},
		}),
		ClickedBack: () => ({
			model,
			outMessage: PageOutMessage.RequestedNavigation({
				href: hrefOf(AppRoute.SettingsIntegrations({ orgSlug: model.orgSlug })),
				replace: false,
			}),
		}),
		ClickedConnect: () => {
			const target = targetOf(model, shared)
			return target === null || model.activity._tag !== "Idle"
				? { model }
				: { model: { ...model, activity: Activity.Connecting() }, commands: [GetOAuthUrl(target)] }
		},
		SucceededGetOAuthUrl: ({ authorizationUrl }) => ({
			model,
			commands: [RedirectToProvider({ authorizationUrl })],
		}),
		FailedGetOAuthUrl: ({ reason }) => ({
			model: { ...model, activity: Activity.Idle() },
			outMessage: PageOutMessage.RequestedToast({
				toast: errorToastOf(failureMessage(reason, { UnsupportedProvider: UNSUPPORTED_PROVIDER })),
			}),
		}),
		CompletedRedirectToProvider: () => ({ model }),
		ClickedDisconnect: () => {
			const target = targetOf(model, shared)
			return target === null || model.activity._tag !== "Idle"
				? { model }
				: { model: { ...model, activity: Activity.Disconnecting() }, commands: [Disconnect(target)] }
		},
		SucceededDisconnect: () => ({ model: { ...model, activity: Activity.Idle() } }),
		FailedDisconnect: ({ reason }) => ({
			model: { ...model, activity: Activity.Idle() },
			outMessage: PageOutMessage.RequestedToast({
				toast: errorToastOf(
					failureMessage(reason, {
						NotConnected: {
							title: "Integration not connected",
							description: "This integration is already disconnected.",
						},
						UnsupportedProvider: UNSUPPORTED_PROVIDER,
					}),
				),
			}),
		}),
		ChangedApiToken: ({ value }) => ({ model: { ...model, apiToken: validateApiToken(value) } }),
		ChangedApiBaseUrl: ({ value }) => ({ model: { ...model, apiBaseUrl: validateApiBaseUrl(value) } }),
		SubmittedApiKeyForm: () => {
			const target = targetOf(model, shared)
			if (target === null || model.activity._tag !== "Idle") return { model }
			const apiToken = validateApiToken(model.apiToken.value)
			const apiBaseUrl = validateApiBaseUrl(model.apiBaseUrl.value)
			const validated = { ...model, apiToken, apiBaseUrl }
			return allValid([
				[apiToken, apiTokenRules],
				[apiBaseUrl, apiBaseUrlRules],
			])
				? {
						model: { ...validated, activity: Activity.Connecting() },
						commands: [
							ConnectApiKey({
								...target,
								token: apiToken.value.trim(),
								baseUrl: apiBaseUrl.value.trim(),
							}),
						],
					}
				: { model: validated }
		},
		SucceededConnectApiKey: ({ externalAccountName }) => ({
			model: { ...model, activity: Activity.Idle() },
			outMessage: PageOutMessage.RequestedToast({
				toast: successToast(
					`Connected to ${nameOf(model) ?? "integration"}`,
					`Connected as ${externalAccountName ?? "your space"}.`,
				),
			}),
		}),
		FailedConnectApiKey: ({ reason }) => ({
			model: { ...model, activity: Activity.Idle() },
			outMessage: PageOutMessage.RequestedToast({
				toast: errorToastOf(
					failureMessage(reason, {
						InvalidApiKey: {
							title: "Invalid credentials",
							description: "Check the bearer token and base URL, then try again.",
						},
						UnsupportedProvider: {
							title: "Unsupported provider",
							description: "This integration does not support API key connections.",
						},
					}),
				),
			}),
		}),
		ToggledConfigOption: ({ optionId, isSelected }) => ({
			model: {
				...model,
				enabledOptionIds: isSelected
					? [...model.enabledOptionIds, optionId]
					: model.enabledOptionIds.filter((id) => id !== optionId),
			},
		}),
	})
