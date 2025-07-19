// icons/svgs/stroke/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconWaterDropletStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
			/>
		</svg>
	)
}

export default IconWaterDropletStroke
