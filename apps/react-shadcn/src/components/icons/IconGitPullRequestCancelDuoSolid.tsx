// icons/svgs/duo-solid/development

import type React from "react"
import type { SVGProps } from "react"

export const IconGitPullRequestCancelDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 9v12m12-6v-2"
				opacity=".28"
			/>
			<path fill="currentColor" d="M6 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
			<path
				fill="currentColor"
				d="M16.207 2.793a1 1 0 1 0-1.414 1.414L16.486 5.9l-1.693 1.693a1 1 0 0 0 1.414 1.414L17.9 7.314l1.693 1.693a1 1 0 1 0 1.414-1.414L19.314 5.9l1.693-1.693a1 1 0 0 0-1.414-1.414L17.9 4.486z"
			/>
			<path fill="currentColor" d="M18 14a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
		</svg>
	)
}

export default IconGitPullRequestCancelDuoSolid
