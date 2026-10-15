import { Option } from "effect"
import type { Html, HtmlBuilder } from "foldkit/html"
import { AppRoute, hrefOf } from "../../route"
import { backgroundImage, logoContent, panelCard, panelFrame } from "../onboarding/brand-panel"

/** The auth pages' frame: the pixel-art panel on large screens (as on `/join`), the form beside it. */

const homeLink = <M>(h: HtmlBuilder<M>, className: string, children: ReadonlyArray<Html>): Html =>
	h.a([h.Class(className), h.Href(hrefOf(AppRoute.Root()))], [...children])

export const authFrame = <M>(h: HtmlBuilder<M>, nowMs: number, content: ReadonlyArray<Html>): Html =>
	h.main(
		[h.Class("grid h-dvh grid-cols-1 lg:grid-cols-2")],
		[
			panelFrame(h, [
				backgroundImage(h, nowMs, "Background"),
				homeLink(
					h,
					"relative z-20 flex items-center gap-2",
					logoContent(h, { logoClassName: "size-8 text-white" }),
				),
				panelCard(h, [
					h.p(
						[h.Class("text-lg text-white")],
						["A calm place for your team to talk, decide and ship."],
					),
				]),
			]),
			h.div(
				[h.Class("flex h-full flex-col p-6 lg:p-12")],
				[
					h.div(
						[h.Class("mb-8 lg:hidden")],
						[
							homeLink(
								h,
								"flex items-center gap-2",
								logoContent(h, { logoClassName: "size-8", textClassName: "text-fg" }),
							),
						],
					),
					h.div([h.Class("m-auto flex w-full max-w-sm flex-col")], [...content]),
				],
			),
		],
	)

export const authHeading = <M>(h: HtmlBuilder<M>, title: string, description: string): Html =>
	h.div(
		[h.Class("mb-8 space-y-2")],
		[
			h.h1([h.Class("font-semibold text-2xl text-fg")], [title]),
			h.p([h.Class("text-muted-fg text-sm")], [description]),
		],
	)

/** A failure under the form, announced to screen readers. */
export const authError = <M>(h: HtmlBuilder<M>, message: string | null): Html | null =>
	message === null ? null : h.p([h.Class("mt-4 text-danger text-sm"), h.Role("alert")], [message])

export const signInLink = <M>(h: HtmlBuilder<M>, label: string): Html =>
	h.a(
		[
			h.Class("text-fg text-sm underline underline-offset-2"),
			h.Href(hrefOf(AppRoute.SignIn({ redirectUrl: Option.none() }))),
		],
		[label],
	)
