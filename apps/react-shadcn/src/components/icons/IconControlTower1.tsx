// icons/svgs/contrast/building

import type React from "react"
import type { SVGProps } from "react"

export const IconControlTower1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3.406 5.825A1.5 1.5 0 0 1 4.87 4h14.26a1.5 1.5 0 0 1 1.464 1.825l-1.159 5.217A2.5 2.5 0 0 1 16.995 13h-9.99a2.5 2.5 0 0 1-2.44-1.958z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3.406 5.825A1.5 1.5 0 0 1 4.87 4h14.26a1.5 1.5 0 0 1 1.464 1.825l-1.159 5.217A2.5 2.5 0 0 1 16.995 13h-9.99a2.5 2.5 0 0 1-2.44-1.958z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4 8h16"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m9 8 1 5"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m15 8-1 5"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 4V2"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m7 13-.5 9M17 13l.5 9"
			/>
		</svg>
	)
}

export default IconControlTower1
