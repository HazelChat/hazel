// icons/svgs/contrast/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconDrawHighlighter1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14 13h-4m4 0a2 2 0 0 1 2 2v5.231M14 13V9.125L12.667 8 10 10.25V13m0 0a2 2 0 0 0-2 2v5.231m8 0a9.15 9.15 0 1 0-8 0m8 0a9.1 9.1 0 0 1-4 .919 9.1 9.1 0 0 1-4-.919"
			/>
		</svg>
	)
}

export default IconDrawHighlighter1
