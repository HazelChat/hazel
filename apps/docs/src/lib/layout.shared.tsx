import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import { HazelLogoOrange } from "@hazel/ui/logo"

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				<div className="flex items-center gap-2 font-semibold">
					<HazelLogoOrange className="size-6" />
					Hazel
				</div>
			),
		},
		links: [
			{ text: "App", url: "https://app.hazel.com", external: true },
			{ text: "GitHub", url: "https://github.com/hazelapp/hazel", external: true },
		],
	}
}
