// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconDivertLeftStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9 8.289a20.8 20.8 0 0 0-5.347-.202.63.63 0 0 0-.386.18m0 0c-.1.1-.166.234-.18.386A20.8 20.8 0 0 0 3.29 14m-.022-5.733 7.612 7.612a3 3 0 0 0 4.242 0L22 9"
				fill="none"
			/>
		</svg>
	)
}

export default IconDivertLeftStroke
