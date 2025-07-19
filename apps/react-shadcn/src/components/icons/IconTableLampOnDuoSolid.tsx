// icons/svgs/duo-solid/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconTableLampOnDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13 12a1 1 0 1 0-2 0v5h-1a3 3 0 0 0-3 3v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-1z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M8.612 2a3 3 0 0 0-2.827 1.995l-2.727 7.67A1 1 0 0 0 4 13h16a1 1 0 0 0 .942-1.335l-2.727-7.67A3 3 0 0 0 15.39 2z"
			/>
			<path fill="currentColor" d="M6.894 15.447a1 1 0 1 0-1.788-.894l-1 2a1 1 0 1 0 1.788.894z" />
			<path fill="currentColor" d="M18.894 14.553a1 1 0 1 0-1.788.894l1 2a1 1 0 1 0 1.788-.894z" />
		</svg>
	)
}

export default IconTableLampOnDuoSolid
