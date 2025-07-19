// icons/svgs/solid/time

import type React from "react"
import type { SVGProps } from "react"

export const IconAlarmRemove: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5.707 2.293a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414l3-3a1 1 0 0 1 1.414 0Z"
				fill="currentColor"
			/>
			<path
				d="M18.293 2.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414Z"
				fill="currentColor"
			/>
			<path
				fillRule="evenodd"
				d="M3 13a9 9 0 1 1 18 0 9 9 0 0 1-18 0Zm5.9-1a1 1 0 1 0 0 2h6.2a1 1 0 1 0 0-2z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconAlarmRemove
