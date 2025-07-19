// icons/svgs/duo-stroke/sports

import type React from "react"
import type { SVGProps } from "react"

export const IconFitnessWeightLiftingDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 7v4m0-4h-.681A2 2 0 0 0 9.48 8.212L7 14m5-7h.681a2 2 0 0 1 1.839 1.212L17 14"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m9 17-1 2-1 3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m15 17 1 2 1 3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3 14h1m0 0h16M4 14v-2m0 2v2m16-2h1m-1 0v-2m0 2v2"
				fill="none"
			/>
		</svg>
	)
}

export default IconFitnessWeightLiftingDuoStroke
