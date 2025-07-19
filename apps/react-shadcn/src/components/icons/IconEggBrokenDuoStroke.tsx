// icons/svgs/duo-stroke/food

import type React from "react"
import type { SVGProps } from "react"

export const IconEggBrokenDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 21.5a7.39 7.39 0 0 0 7.39-7.389C19.39 10.031 16.08 2.5 12 2.5s-7.389 7.53-7.389 11.611a7.39 7.39 0 0 0 7.39 7.389Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M6.015 6.089q.602.253 1.152.595A8.6 8.6 0 0 1 9.34 8.605l-1.428 1.977c-.24.332-.282.801-.04 1.186.787 1.253 1.885 2.321 3.465 2.855a1 1 0 0 0 .64-1.895c-.845-.285-1.51-.805-2.056-1.512l1.425-1.973c.256-.354.292-.856.02-1.256a10.46 10.46 0 0 0-4.223-3.585c-.41.524-.786 1.094-1.128 1.687Z"
			/>
		</svg>
	)
}

export default IconEggBrokenDuoStroke
