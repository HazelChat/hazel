// icons/svgs/contrast/time

import type React from "react"
import type { SVGProps } from "react"

export const IconAlarmRemove1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M20 13a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 3 2 6m17-3 3 3M9 13h6m5 0a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
			/>
		</svg>
	)
}

export default IconAlarmRemove1
