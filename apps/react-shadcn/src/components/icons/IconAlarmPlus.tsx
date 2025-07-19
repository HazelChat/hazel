// icons/svgs/solid/time

import type React from "react"
import type { SVGProps } from "react"

export const IconAlarmPlus: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3 13a9 9 0 1 1 18 0 9 9 0 0 1-18 0Zm10-3.1a1 1 0 1 0-2 0V12H8.9a1 1 0 1 0 0 2H11v2.1a1 1 0 1 0 2 0V14h2.1a1 1 0 1 0 0-2H13z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconAlarmPlus
