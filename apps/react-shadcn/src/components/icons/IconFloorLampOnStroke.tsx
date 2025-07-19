// icons/svgs/stroke/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconFloorLampOnStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 21V10M9 21h6m-7-8-1 2m9-2 1 2m1-5-1.937-5.649A2 2 0 0 0 14.171 3H9.83a2 2 0 0 0-1.892 1.351L6 10z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFloorLampOnStroke
