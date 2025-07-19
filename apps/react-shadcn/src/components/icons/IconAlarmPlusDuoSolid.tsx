// icons/svgs/duo-solid/time

import type React from "react"
import type { SVGProps } from "react"

export const IconAlarmPlusDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M12 4a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" opacity=".28" />
			<path fill="currentColor" d="M5.707 3.707a1 1 0 0 0-1.414-1.414l-3 3a1 1 0 0 0 1.414 1.414z" />
			<path fill="currentColor" d="M19.707 2.293a1 1 0 1 0-1.414 1.414l3 3a1 1 0 1 0 1.414-1.414z" />
			<path
				fill="currentColor"
				d="M13 9.9a1 1 0 1 0-2 0V12H8.9a1 1 0 1 0 0 2H11v2.1a1 1 0 1 0 2 0V14h2.1a1 1 0 1 0 0-2H13z"
			/>
		</svg>
	)
}

export default IconAlarmPlusDuoSolid
