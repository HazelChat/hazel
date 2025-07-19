// icons/svgs/stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconBanLeftStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5.53 5.53a9.15 9.15 0 1 1 12.94 12.94M5.53 5.53a9.15 9.15 0 0 0 12.94 12.94M5.53 5.53l12.94 12.94"
				fill="none"
			/>
		</svg>
	)
}

export default IconBanLeftStroke
