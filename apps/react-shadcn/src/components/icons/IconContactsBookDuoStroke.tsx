// icons/svgs/duo-stroke/communication

import type React from "react"
import type { SVGProps } from "react"

export const IconContactsBookDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3.011 16C3 15.423 3 14.764 3 14v-4c0-.764 0-1.423.011-2m0 8c.03 1.54.138 2.492.534 3.27a5 5 0 0 0 2.185 2.185C6.8 22 8.2 22 11 22h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 18.2 21 16.8 21 14v-4c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 2 15.8 2 13 2h-2c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 4.73c-.396.778-.504 1.73-.534 3.27m0 8H2m1.011 0H4m-.989-8H2m1.011 0H4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14.222 8.77a2.222 2.222 0 1 1-4.444 0 2.222 2.222 0 0 1 4.444 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14.222 13.667H9.778a2.22 2.22 0 0 0-2.222 2.222A1.11 1.11 0 0 0 8.666 17h6.667c.614 0 1.112-.497 1.112-1.11a2.22 2.22 0 0 0-2.223-2.223Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconContactsBookDuoStroke
