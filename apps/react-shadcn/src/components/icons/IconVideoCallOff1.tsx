// icons/svgs/contrast/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconVideoCallOff1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13 19a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17.001 13.934a2 2 0 0 0 .713 1.466l1 .84c1.3 1.093 3.286.168 3.286-1.532V9.292c0-1.7-1.985-2.624-3.286-1.531l-1 .84A2 2 0 0 0 17 10.059m0 3.875V15a4 4 0 0 1-4 4h-2.343M17 13.934v-3.875m0 0V9c0-.587-.126-1.144-.354-1.646M2 22l3.101-3.101M22.001 2l-5.355 5.354M5.102 18.899A4 4 0 0 1 2 15V9a4 4 0 0 1 4-4h7q.166 0 .33.014M5.1 18.899 16.647 7.354"
			/>
		</svg>
	)
}

export default IconVideoCallOff1
