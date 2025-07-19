// icons/svgs/stroke/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconMouseScrollStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14 14.5a10 10 0 0 1-1.704 1.77.47.47 0 0 1-.592 0A10 10 0 0 1 10 14.5m4-5a10 10 0 0 0-1.704-1.77.47.47 0 0 0-.592 0A10 10 0 0 0 10 9.5m9 .5v4a7 7 0 1 1-14 0v-4a7 7 0 0 1 14 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMouseScrollStroke
