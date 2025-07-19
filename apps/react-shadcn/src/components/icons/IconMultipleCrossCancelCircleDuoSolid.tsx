// icons/svgs/duo-solid/maths

import type React from "react"
import type { SVGProps } from "react"

export const IconMultipleCrossCancelCircleDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15 5.605 0 10.15-4.544 10.15-10.15S17.605 1.85 12 1.85Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8.9 15.1 12 12m0 0 3.1-3.1M12 12 8.9 8.9M12 12l3.1 3.1"
			/>
		</svg>
	)
}

export default IconMultipleCrossCancelCircleDuoSolid
