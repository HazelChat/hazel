// icons/svgs/stroke/alerts

import type React from "react"
import type { SVGProps } from "react"

export const IconInformationCircleStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 12v4m0-7.375zM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconInformationCircleStroke
