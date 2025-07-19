// icons/svgs/duo-stroke/sports

import type React from "react"
import type { SVGProps } from "react"

export const IconFitnessRunDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m14 20 2.078-2.771a1 1 0 0 0-.575-1.574l-2.76-.637a2 2 0 0 1-1.417-2.667L13 8h-2.528a4 4 0 0 0-3.578 2.211L6 12"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m9.5 17-.906 1.812a5 5 0 0 1-1.699 1.924L5 22"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m16 9.5.02.031a2 2 0 0 0 2.56.68L19 10"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconFitnessRunDuoStroke
