import { Schema } from "effect"
import * as CommandPalette from "../overlay/command-palette"
import * as Modal from "../overlay/modal"
import * as Toasts from "../overlay/toaster"
import type { PageHost, Shared } from "../page/contract"
import { PageSlot } from "../page/registry"
import { AppRoute, orgSectionOf, orgSlugOf } from "../route"
import { Auth, CurrentUser, Member, Organization } from "../session"
import { SoundSettings } from "../notification-sound"
import * as Platform from "../platform"
import * as Updates from "../platform/updates"
import * as Shell from "../shell/model"
import { ResolvedTheme, resolveTheme, ThemePreference } from "../theme"
import type { Context as ShellUpdateContext } from "../shell/update"
import { can } from "../page/contract"

/**
 * The organization query for `slug`: `Found` (the shell renders), `NotFound` (no such org, or the
 * user is not a member) or `Stalled` (not loaded after a while; the loader offers a reload).
 */
export const OrgLoad = Schema.Struct({
	slug: Schema.String,
	status: Schema.Literals(["Found", "NotFound", "Stalled"]),
})
export type OrgLoad = typeof OrgLoad.Type

/** The root Model: route, session, the active page, the shell and the overlay slots. */
export const Model = Schema.Struct({
	route: AppRoute,
	pathname: Schema.String,
	/** `pathname + search`, for `redirect_url`. */
	currentUrl: Schema.String,
	auth: Auth,
	currentUser: Schema.NullOr(CurrentUser),
	organization: Schema.NullOr(Organization),
	/** How far the route's organization has loaded; until `slug` matches the route, a loader shows. */
	orgLoad: Schema.NullOr(OrgLoad),
	/** The session check or `user.me` keeps failing: the loader offers a reload while retries go on. */
	isSessionStalled: Schema.Boolean,
	isCurrentUserStalled: Schema.Boolean,
	member: Schema.NullOr(Member),
	nowMs: Schema.Number,
	/** The stored theme preference (`themeAtom`, `themeCustomizationAtom`), and the system's theme. */
	themePreference: ThemePreference,
	systemTheme: ResolvedTheme,
	/** `notificationSoundSettingsAtom`, stored like legacy. */
	soundSettings: SoundSettings,
	/** When this app load started (from Flags), for the notification sinks. */
	sessionStartMs: Schema.Number,
	page: Schema.NullOr(PageSlot),
	shell: Shell.Model,
	modal: Modal.Model,
	commandPalette: CommandPalette.Model,
	toasts: Toasts.Model,
	/** Presence and the Rivet client (legacy `PresenceProvider`, `lib/rivet-client.ts`). */
	platform: Platform.Model,
	/** The desktop app's update check and install. */
	desktopUpdate: Updates.Model,
})
export type Model = typeof Model.Type

export const resolvedThemeOf = (model: Model): ResolvedTheme =>
	resolveTheme(model.themePreference.mode, model.systemTheme)

export const sharedOf = (model: Model): Shared => ({
	auth: model.auth,
	orgSlug: orgSlugOf(model.route) ?? null,
	currentUser: model.currentUser,
	organization: model.organization,
	member: model.member,
	nowMs: model.nowMs,
	isMobile: model.shell.isMobile,
	theme: { ...model.themePreference, resolved: resolvedThemeOf(model) },
	soundSettings: model.soundSettings,
	desktopUpdate: model.desktopUpdate,
	isOverlayOpen: model.modal.current !== null || model.commandPalette.isOpen,
})

export const pageHostOf = (model: Model): PageHost => ({ page: model.page, shared: sharedOf(model) })

export const shellContextOf = (model: Model): ShellUpdateContext => ({
	orgSlug: orgSlugOf(model.route) ?? null,
	isChatSection: orgSectionOf(model.route) === "Chat",
	canCreateChannel: can(sharedOf(model), "channel.create"),
	organizationId: model.organization?.id ?? null,
	currentUserId: model.currentUser?.id ?? null,
})
