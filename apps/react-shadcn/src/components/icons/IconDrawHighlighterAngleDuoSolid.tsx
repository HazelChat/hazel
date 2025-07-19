// icons/svgs/duo-solid/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconDrawHighlighterAngleDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				fillRule="evenodd"
				d="M7.364 11.223c.05.432.24.852.572 1.184l5.657 5.657c.332.332.752.523 1.185.572L13 20.416a2 2 0 0 1-1.414.584H4a2 2 0 0 1-2-2v-1.17a3 3 0 0 1 .879-2.12z"
				clipRule="evenodd"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m17.164 15.907-1.45 1.45a1 1 0 0 1-1.414 0L8.643 11.7a1 1 0 0 1 0-1.414l1.45-1.45m7.07 7.071a2.5 2.5 0 0 0 3.148-.318l2.474-2.475m-5.621 2.793a2.5 2.5 0 0 1-.389-.318l-6.364-6.364a2.5 2.5 0 0 1-.318-.389m0 0a2.5 2.5 0 0 1 .318-3.146l2.475-2.475"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconDrawHighlighterAngleDuoSolid
