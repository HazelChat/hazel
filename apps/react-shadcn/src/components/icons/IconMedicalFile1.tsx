// icons/svgs/contrast/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconMedicalFile1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3 10c0-2.8 0-4.2.545-5.27A5 5 0 0 1 5.73 2.545C6.8 2 8.2 2 11 2h2c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C21 5.8 21 7.2 21 10v4c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185C17.2 22 15.8 22 13 22h-2c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C3 18.2 3 16.8 3 14z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3.011 16C3 15.423 3 14.764 3 14v-4c0-.764 0-1.423.011-2m0 8c.03 1.54.138 2.492.534 3.27a5 5 0 0 0 2.185 2.185C6.8 22 8.2 22 11 22h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 18.2 21 16.8 21 14v-4c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 2 15.8 2 13 2h-2c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 4.73c-.396.778-.504 1.73-.534 3.27m0 8H2m1.011 0H4m-.989-8H2m1.011 0H4m8-1.668v3m0 0v3m0-3 2.598-1.5M12 9.332l-2.597 1.5M12 9.332l2.598 1.5m-2.599-1.5-2.597-1.5M9 17h6"
			/>
		</svg>
	)
}

export default IconMedicalFile1
