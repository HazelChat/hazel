// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconThreeDotsMenuVerticalCircleDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 21.15a9.15 9.15 0 1 0 0-18.3 9.15 9.15 0 0 0 0 18.3Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12.005 7.994v.01m0 3.99v.01m0 3.99v.01"
				fill="none"
			/>
		</svg>
	)
}

export default IconThreeDotsMenuVerticalCircleDuoStroke
