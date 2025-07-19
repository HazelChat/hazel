// icons/svgs/duo-stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconGitBranchCancelDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 15.5v-1m0 0V3m0 11.5a9 9 0 0 1 9-9"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m16 21.3 2.4-2.4m0 0 2.4-2.4m-2.4 2.4L16 16.5m2.4 2.4 2.4 2.4M6 15.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm15-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGitBranchCancelDuoStroke
