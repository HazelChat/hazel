// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFaceSadDisappointedDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m8.386 10.005 1.228-.86m4.771 0 1.229.86M8.429 16A5 5 0 0 1 12 14.5c1.4 0 2.664.574 3.572 1.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconFaceSadDisappointedDuoStroke
