// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListArrowDownDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 12h8m-8 6h8M4 6h16"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16 16.186a15 15 0 0 0 2.556 2.654c.13.105.287.157.444.157m3-2.811a15 15 0 0 1-2.556 2.654.7.7 0 0 1-.444.157m0 0V11.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconListArrowDownDuoStroke
