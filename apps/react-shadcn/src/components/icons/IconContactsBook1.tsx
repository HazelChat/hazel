// icons/svgs/contrast/communication

import type React from "react"
import type { SVGProps } from "react"

export const IconContactsBook1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13 2h-2c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 4.73C3 5.8 3 7.2 3 10v4c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C6.8 22 8.2 22 11 22h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 18.2 21 16.8 21 14v-4c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 2 15.8 2 13 2Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M2 8h2m-2 8h2m7 6h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 18.2 21 16.8 21 14v-4c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 2 15.8 2 13 2h-2c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 4.73C3 5.8 3 7.2 3 10v4c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C6.8 22 8.2 22 11 22Zm3.222-13.231a2.222 2.222 0 1 1-4.444 0 2.222 2.222 0 0 1 4.444 0Zm-4.444 4.898a2.22 2.22 0 0 0-2.222 2.222A1.11 1.11 0 0 0 8.666 17h6.667a1.11 1.11 0 0 0 1.111-1.111 2.22 2.22 0 0 0-2.222-2.222z"
			/>
		</svg>
	)
}

export default IconContactsBook1
