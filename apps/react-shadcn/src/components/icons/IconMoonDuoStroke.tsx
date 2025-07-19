// icons/svgs/duo-stroke/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconMoonDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16 14a6 6 0 0 0 4.977-2.648Q21 11.673 21 12a9 9 0 1 1-8.352-8.977A6 6 0 0 0 16 14Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M20.977 11.352a6 6 0 1 1-8.329-8.33"
				fill="none"
			/>
		</svg>
	)
}

export default IconMoonDuoStroke
