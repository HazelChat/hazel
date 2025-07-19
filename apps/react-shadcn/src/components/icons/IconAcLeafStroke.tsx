// icons/svgs/stroke/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconAcLeafStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18 8h-2m-1.198 14 .04-.11a6.13 6.13 0 0 1 2.317-2.963M22 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6zm-5.323 4.072c-1.473.85-2.025 2.65-1.383 3.76.64 1.11 2.476 1.532 3.948.682s3.036-3.974 2.716-4.53c-.32-.555-3.81-.762-5.281.088Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAcLeafStroke
