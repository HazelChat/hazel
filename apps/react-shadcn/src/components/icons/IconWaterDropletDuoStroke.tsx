// icons/svgs/duo-stroke/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconWaterDropletDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 3c13 11 5.712 18 0 18s-13-7 0-18Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19.257 14c.218 4.446-3.807 7-7.257 7s-7.475-2.554-7.257-7"
				fill="none"
			/>
		</svg>
	)
}

export default IconWaterDropletDuoStroke
