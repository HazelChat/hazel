// icons/svgs/duo-stroke/communication

import type React from "react"
import type { SVGProps } from "react"

export const IconSendPlaneHorizontalDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4.934 12 3.09 5.732c-.481-1.635 1.05-3.147 2.665-2.628a54 54 0 0 1 12.64 5.963C19.525 9.793 21 10.442 21 12s-1.474 2.207-2.605 2.933a54 54 0 0 1-12.64 5.963c-1.614.519-3.146-.993-2.665-2.628zm0 0h4.9"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4.934 12h4.9M13 17.975a54 54 0 0 0 5.395-3.042C19.525 14.207 21 13.558 21 12c0-1.559-1.474-2.207-2.605-2.934A54 54 0 0 0 13 6.025"
				fill="none"
			/>
		</svg>
	)
}

export default IconSendPlaneHorizontalDuoStroke
