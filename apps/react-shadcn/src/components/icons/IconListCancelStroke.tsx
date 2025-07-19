// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListCancelStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 12h6m-6 6h6M4 6h16m-5.5 11.497 2.5-2.5m0 0 2.5-2.5m-2.5 2.5-2.5-2.5m2.5 2.5 2.5 2.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconListCancelStroke
