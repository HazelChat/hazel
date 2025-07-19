// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconThermometerDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15 5a3 3 0 1 0-6 0v10.354a4 4 0 1 0 6 0z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 0v-7"
				fill="none"
			/>
		</svg>
	)
}

export default IconThermometerDuoStroke
