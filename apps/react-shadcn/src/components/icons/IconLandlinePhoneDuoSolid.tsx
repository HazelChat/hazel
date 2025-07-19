// icons/svgs/duo-solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconLandlinePhoneDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19 3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-8a1 1 0 0 1-1-1V4l.005-.103A1 1 0 0 1 11 3z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M6.5 2A2.5 2.5 0 0 1 9 4.5v15A2.5 2.5 0 0 1 6.5 22h-2A2.5 2.5 0 0 1 2 19.5v-15A2.5 2.5 0 0 1 4.5 2z"
			/>
			<path fill="currentColor" d="M14.5 16a1 1 0 1 1 0 2H13a1 1 0 1 1 0-2z" />
			<path fill="currentColor" d="M19 16a1 1 0 1 1 0 2h-1.5a1 1 0 1 1 0-2z" />
			<path fill="currentColor" d="M14.5 13a1 1 0 1 1 0 2H13a1 1 0 1 1 0-2z" />
			<path fill="currentColor" d="M19 13a1 1 0 1 1 0 2h-1.5a1 1 0 1 1 0-2z" />
			<path
				fill="currentColor"
				d="M19.103 5.005A1 1 0 0 1 20 6v4a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V6l.005-.103A1 1 0 0 1 13 5h6z"
			/>
		</svg>
	)
}

export default IconLandlinePhoneDuoSolid
