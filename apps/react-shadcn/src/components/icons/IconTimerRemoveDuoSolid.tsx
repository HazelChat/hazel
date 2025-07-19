// icons/svgs/duo-solid/time

import type React from "react"
import type { SVGProps } from "react"

export const IconTimerRemoveDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10 1a1 1 0 0 0 0 2h1v2.055A9.001 9.001 0 0 0 12 23a9 9 0 0 0 1-17.945V3h1a1 1 0 1 0 0-2z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M20.074 4.615a1 1 0 1 0-1.414 1.414l1.06 1.06a1 1 0 1 0 1.415-1.414z"
			/>
			<path fill="currentColor" d="M8.9 13.003a1 1 0 0 0 0 2h6.2a1 1 0 1 0 0-2z" />
		</svg>
	)
}

export default IconTimerRemoveDuoSolid
