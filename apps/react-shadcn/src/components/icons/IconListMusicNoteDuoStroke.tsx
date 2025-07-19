// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListMusicNoteDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 12h6m-6 6h6M4 6h16"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17 17.5a1.5 1.5 0 1 1-3 .002 1.5 1.5 0 0 1 3-.001Zm0 0v-6.678a.82.82 0 0 1 1.187-.734A3.28 3.28 0 0 1 20 13.023a3.6 3.6 0 0 1-.312 1.477"
				fill="none"
			/>
		</svg>
	)
}

export default IconListMusicNoteDuoStroke
