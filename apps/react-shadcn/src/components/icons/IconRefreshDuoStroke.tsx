// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconRefreshDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18.07 6.785a8 8 0 0 0-13.912 6.797m15.75-2.79A8 8 0 0 1 5.93 17.214"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17.5 2.474A15 15 0 0 1 18.549 6.2a.48.48 0 0 1-.298.515l-.181.07a15 15 0 0 1-3.57.885m-8 13.856A15 15 0 0 1 5.45 17.8a.48.48 0 0 1 .298-.515l.18-.07a15 15 0 0 1 3.57-.885"
				fill="none"
			/>
		</svg>
	)
}

export default IconRefreshDuoStroke
