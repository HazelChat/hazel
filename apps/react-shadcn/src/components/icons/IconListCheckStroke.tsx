// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListCheckStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 12h6m-6 6h6M4 6h16m-6.5 8.978 2.341 2.339a15 15 0 0 1 4.558-4.936"
				fill="none"
			/>
		</svg>
	)
}

export default IconListCheckStroke
