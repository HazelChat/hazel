// icons/svgs/duo-stroke/building

import type React from "react"
import type { SVGProps } from "react"

export const IconControlTowerDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7.005 13h9.99a2.5 2.5 0 0 0 2.44-1.958L20.111 8H3.89l.676 3.042A2.5 2.5 0 0 0 7.005 13Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19.13 4H4.87a1.5 1.5 0 0 0-1.464 1.825L3.889 8H20.11l.483-2.175A1.5 1.5 0 0 0 19.13 4Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m9 8 1 5"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m15 8-1 5"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 3V2"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m7 13-.5 9M17 13l.5 9"
				fill="none"
			/>
		</svg>
	)
}

export default IconControlTowerDuoStroke
