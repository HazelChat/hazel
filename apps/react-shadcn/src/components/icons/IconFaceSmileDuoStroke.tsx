// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFaceSmileDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9 10v1m6-1v1m-6.57 3.5A5 5 0 0 0 12 16a5 5 0 0 0 3.57-1.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconFaceSmileDuoStroke
