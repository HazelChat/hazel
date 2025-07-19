// icons/svgs/duo-solid/sports

import type React from "react"
import type { SVGProps } from "react"

export const IconDumbbellDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9 11h6M5 9H4a2 2 0 1 0 0 4h1m14 0h1a2 2 0 1 0 0-4h-1"
				opacity=".28"
			/>
			<path fill="currentColor" d="M4 7a3 3 0 0 1 6 0v8a3 3 0 1 1-6 0z" />
			<path fill="currentColor" d="M14 7a3 3 0 1 1 6 0v8a3 3 0 1 1-6 0z" />
		</svg>
	)
}

export default IconDumbbellDuoSolid
