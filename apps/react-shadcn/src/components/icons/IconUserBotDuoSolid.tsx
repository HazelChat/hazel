// icons/svgs/duo-solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserBotDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8 14a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M13 3a1 1 0 1 0-2 0v1h-1a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-1z"
			/>
		</svg>
	)
}

export default IconUserBotDuoSolid
