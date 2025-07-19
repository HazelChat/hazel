// icons/svgs/duo-stroke/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconCloudMoonDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20 8c.729 0 1.412-.195 2-.535V7.5a5.5 5.5 0 0 1-4.105 5.321 4.8 4.8 0 0 0-1.45-.97 5.64 5.64 0 0 0-5.423-3.85A5.5 5.5 0 0 1 16.5 2h.035A4 4 0 0 0 20 8Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5.491 13.222c.213-2.525 2.15-4.778 4.789-5.163Q10.68 8 11.1 8c2.488 0 4.6 1.614 5.346 3.852A4.768 4.768 0 0 1 14.566 21H5.9a3.9 3.9 0 0 1-.419-7.778zm0 0a5.5 5.5 0 0 0 .126 1.711"
				fill="none"
			/>
		</svg>
	)
}

export default IconCloudMoonDuoStroke
