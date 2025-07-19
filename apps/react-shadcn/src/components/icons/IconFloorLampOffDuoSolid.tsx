// icons/svgs/duo-solid/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconFloorLampOffDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.829 2A3 3 0 0 0 6.99 4.027L5.054 9.676A1 1 0 0 0 6 11h12a1 1 0 0 0 .946-1.324l-1.937-5.649A3 3 0 0 0 14.171 2z"
			/>
		</svg>
	)
}

export default IconFloorLampOffDuoSolid
