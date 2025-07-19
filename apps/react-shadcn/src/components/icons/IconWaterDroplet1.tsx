// icons/svgs/contrast/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconWaterDroplet1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 3c13 11 5.712 18 0 18s-13-7 0-18Z"
			/>
			<path fill="currentColor" d="M12 3c13 11 5.712 18 0 18s-13-7 0-18Z" opacity=".28" />
		</svg>
	)
}

export default IconWaterDroplet1
