// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListSearch1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.5 15c0-1.659-1.341-3-3-3s-3 1.341-3 3 1.341 3 3 3c1.654 0 3-1.346 3-3Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4 12h6m-6 6h6M4 6h16m1 12.5-1.379-1.379m0 0A2.998 2.998 0 0 0 17.5 12c-1.659 0-3 1.341-3 3a2.998 2.998 0 0 0 5.121 2.121Z"
			/>
		</svg>
	)
}

export default IconListSearch1
