// icons/svgs/contrast/development

import type React from "react"
import type { SVGProps } from "react"

export const IconGitPullRequestDraft1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M21 18a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
				<path fill="currentColor" d="M9 6a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 9v12M6 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm12 4v2m0 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-5-9q.514 0 1 .1M17 8q.348.462.584 1"
			/>
		</svg>
	)
}

export default IconGitPullRequestDraft1
