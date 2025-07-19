// icons/svgs/duo-stroke/alerts

import type React from "react"
import type { SVGProps } from "react"

export const IconInformationCircleDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 12v4m0-7.375z"
				fill="none"
			/>
		</svg>
	)
}

export default IconInformationCircleDuoStroke
