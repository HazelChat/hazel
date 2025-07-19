// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconThreeDotsMenuVerticalCircleStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.005 16.005v-.01m0-3.99v-.01m0-3.99v-.01M12 2.85a9.15 9.15 0 1 1 0 18.3 9.15 9.15 0 0 1 0-18.3Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconThreeDotsMenuVerticalCircleStroke
