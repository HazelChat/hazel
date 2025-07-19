// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowTurnLeftDown1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 15.142a25.2 25.2 0 0 0 4.505 4.684.79.79 0 0 0 .99 0A25.2 25.2 0 0 0 14 15.142c-.935.16-1.402.24-1.87.302a24 24 0 0 1-6.26 0A50 50 0 0 1 4 15.142Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9 15.649V12c0-2.8 0-4.2.545-5.27a5 5 0 0 1 2.185-2.185C12.8 4 14.2 4 17 4h3M9 15.649q-1.57 0-3.13-.205A50 50 0 0 1 4 15.141a25.2 25.2 0 0 0 4.505 4.684.79.79 0 0 0 .99 0A25.2 25.2 0 0 0 14 15.141c-.935.16-1.402.241-1.87.303a24 24 0 0 1-3.13.205Z"
			/>
		</svg>
	)
}

export default IconArrowTurnLeftDown1
