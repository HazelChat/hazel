// icons/svgs/solid/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconFloorLampOn: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.829 2A3 3 0 0 0 6.99 4.027L5.054 9.676A1 1 0 0 0 6 11h5v9H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-9h5a1 1 0 0 0 .946-1.324l-1.937-5.649A3 3 0 0 0 14.171 2z"
				fill="currentColor"
			/>
			<path d="M8.894 13.447a1 1 0 1 0-1.788-.894l-1 2a1 1 0 1 0 1.788.894z" fill="currentColor" />
			<path d="M16.894 12.553a1 1 0 1 0-1.788.894l1 2a1 1 0 1 0 1.788-.894z" fill="currentColor" />
		</svg>
	)
}

export default IconFloorLampOn
