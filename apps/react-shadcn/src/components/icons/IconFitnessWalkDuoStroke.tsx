// icons/svgs/duo-stroke/sports

import type React from "react"
import type { SVGProps } from "react"

export const IconFitnessWalkDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m18 22-2.406-4.812a5 5 0 0 0-1.699-1.924l-1.004-.67A2 2 0 0 1 12 12.93V7L9.42 8.935a5 5 0 0 0-1.85 2.787L7 14"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m10.5 17.5-.013.063a6 6 0 0 1-2.555 3.816L7 22"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19 10h-1.586C16.51 10 15.64 9.64 15 9"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconFitnessWalkDuoStroke
