// icons/svgs/duo-stroke/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconTableLampOffDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.727 4.33A2 2 0 0 1 8.612 3h6.777a2 2 0 0 1 1.884 1.33L20 12H4z"
				fill="none"
			/>
		</svg>
	)
}

export default IconTableLampOffDuoStroke
