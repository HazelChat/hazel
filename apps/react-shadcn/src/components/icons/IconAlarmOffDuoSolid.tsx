// icons/svgs/duo-solid/time

import type React from "react"
import type { SVGProps } from "react"

export const IconAlarmOffDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path
					fill="currentColor"
					d="M5.707 2.293a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414l3-3a1 1 0 0 1 1.414 0Z"
				/>
				<path
					fill="currentColor"
					d="M18.293 2.293a1 1 0 0 1 1.414 0l1 1a1 1 0 0 1-1.414 1.414l-1-1a1 1 0 0 1 0-1.414Z"
				/>
				<path
					fill="currentColor"
					d="M3 13a9 9 0 0 1 14.777-6.901 1 1 0 0 1 .065 1.473L13 12.414V9.898a1 1 0 1 0-2 0v3.819c0 .202.04.4.117.58l-4.545 4.545a1 1 0 0 1-1.473-.065A8.97 8.97 0 0 1 3 13Z"
				/>
				<path
					fill="currentColor"
					d="m12.669 15.57-4.208 4.207a1 1 0 0 0 .353 1.642A9 9 0 0 0 20.42 9.814a1 1 0 0 0-1.643-.352l-4.65 4.65.947.571a1 1 0 1 1-1.031 1.714z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M22 2 2 22"
			/>
		</svg>
	)
}

export default IconAlarmOffDuoSolid
