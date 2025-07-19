// icons/svgs/duo-stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconMediaSpeed1xDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.022 19V5c-1.805.442-3.185 1.685-4.003 3.323"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m13 19 3.5-4.5m0 0L20 10m-3.5 4.5L20 19m-3.5-4.5L13 10"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconMediaSpeed1xDuoStroke
