// icons/svgs/duo-stroke/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconTableLampOnDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 18v-6m-3 9h6m1 0v-1a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m6 15-1 2m13-2 1 2M8.612 3h6.777a2 2 0 0 1 1.884 1.33L20 12H4l2.727-7.67A2 2 0 0 1 8.612 3Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconTableLampOnDuoStroke
