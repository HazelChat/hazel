// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListSearchDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 12h6m-6 6h6M4 6h16"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m21 18.5-1.379-1.379m0 0A2.998 2.998 0 0 0 17.5 12c-1.659 0-3 1.341-3 3a2.998 2.998 0 0 0 5.121 2.121Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconListSearchDuoStroke
