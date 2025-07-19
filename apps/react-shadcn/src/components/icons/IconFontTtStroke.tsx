// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconFontTtStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17 19v-6m-7 6V5m4 8h6M4 5h12"
				fill="none"
			/>
		</svg>
	)
}

export default IconFontTtStroke
