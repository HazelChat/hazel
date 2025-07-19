// icons/svgs/duo-stroke/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconCloudWindDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15.583 18h.917a5.5 5.5 0 0 0 2.17-10.556A6.5 6.5 0 0 0 6.018 9.026m0 0A4.5 4.5 0 0 0 3.672 10m2.346-.974c-.024.321-.023.652.001.974"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M2 14h11a2 2 0 1 0-1-3.732M2 18h8a2 2 0 1 1-1 3.732"
				fill="none"
			/>
		</svg>
	)
}

export default IconCloudWindDuoStroke
