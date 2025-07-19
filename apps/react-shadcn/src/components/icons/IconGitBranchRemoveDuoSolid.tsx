// icons/svgs/duo-solid/development

import type React from "react"
import type { SVGProps } from "react"

export const IconGitBranchRemoveDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6 15.5v-1m0 0V3m0 11.5a9 9 0 0 1 9-9"
				opacity=".28"
			/>
			<path fill="currentColor" d="M14 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />
			<path fill="currentColor" d="M2 18.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />
			<path fill="currentColor" d="M15 17a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z" />
		</svg>
	)
}

export default IconGitBranchRemoveDuoSolid
