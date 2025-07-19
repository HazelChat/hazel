// icons/svgs/duo-solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconGamingPadDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.667 4A7.667 7.667 0 0 0 1 11.667v5.243a4.09 4.09 0 0 0 7.749 1.829l.145-.292A2.62 2.62 0 0 1 11.236 17h1.528c.992 0 1.898.56 2.342 1.447l.146.292A4.09 4.09 0 0 0 23 16.909v-5.242A7.667 7.667 0 0 0 15.333 4z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8 13v-2m0 0V9m0 2H6m2 0h2m5.01-2-.01.001M18.01 12l-.01.001"
			/>
		</svg>
	)
}

export default IconGamingPadDuoSolid
