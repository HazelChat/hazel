// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconTextQuotesOpenStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14 13.998a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm0 0A9.4 9.4 0 0 1 18 6.3M4 13.998a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm0 0A9.4 9.4 0 0 1 8 6.3"
				fill="none"
			/>
		</svg>
	)
}

export default IconTextQuotesOpenStroke
