// icons/svgs/duo-solid/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconFloorLampOnDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 21V10M9 21h6"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M6.99 4.027A3 3 0 0 1 9.83 2h4.342a3 3 0 0 1 2.838 2.027l1.937 5.649A1 1 0 0 1 18 11H6a1 1 0 0 1-.946-1.324z"
			/>
			<path fill="currentColor" d="M8.894 13.447a1 1 0 1 0-1.788-.894l-1 2a1 1 0 1 0 1.788.894z" />
			<path fill="currentColor" d="M16.894 12.553a1 1 0 1 0-1.788.894l1 2a1 1 0 1 0 1.788-.894z" />
		</svg>
	)
}

export default IconFloorLampOnDuoSolid
