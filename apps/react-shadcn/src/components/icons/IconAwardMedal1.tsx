// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconAwardMedal1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19 9a6.99 6.99 0 0 1-2.635 5.472A6.97 6.97 0 0 1 12 16a6.97 6.97 0 0 1-4.365-1.528A7 7 0 1 1 19 9Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16.365 14.472 18 22c-4.286-2.664-7.714-2.664-12 0l1.635-7.528m8.73 0a7 7 0 1 0-8.73 0m8.73 0A6.97 6.97 0 0 1 12 16a6.97 6.97 0 0 1-4.365-1.528"
			/>
		</svg>
	)
}

export default IconAwardMedal1
