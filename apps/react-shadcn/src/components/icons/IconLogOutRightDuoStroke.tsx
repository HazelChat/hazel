// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconLogOutRightDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13 4.528A6 6 0 0 0 3 9v6a6 6 0 0 0 10 4.472"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18.189 9a15 15 0 0 1 2.654 2.556c.105.13.157.287.157.444m-2.811 3a15 15 0 0 0 2.654-2.556A.7.7 0 0 0 21 12m0 0H8"
				fill="none"
			/>
		</svg>
	)
}

export default IconLogOutRightDuoStroke
