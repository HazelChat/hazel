// icons/svgs/duo-stroke/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconMedicinePillCapsuleDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4.222 19.778a5.25 5.25 0 0 1 0-7.427l8.129-8.13a5.252 5.252 0 0 1 7.427 7.428l-8.129 8.13a5.25 5.25 0 0 1-7.427 0Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15.714 15.714 8.287 8.286m5.121.184 1.768-1.767a1.5 1.5 0 0 1 1.708-.294"
				fill="none"
			/>
		</svg>
	)
}

export default IconMedicinePillCapsuleDuoStroke
