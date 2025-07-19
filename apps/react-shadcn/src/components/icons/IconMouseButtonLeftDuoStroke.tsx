// icons/svgs/duo-stroke/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconMouseButtonLeftDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19 14v-4a7 7 0 0 0-7-7v4.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C10.48 11 9.92 11 8.8 11H5v3a7 7 0 1 0 14 0Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 10a7 7 0 0 1 7-7v4.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C10.48 11 9.92 11 8.8 11H5z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMouseButtonLeftDuoStroke
