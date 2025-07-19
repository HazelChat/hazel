// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconPowerStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 8V2M7.556 4a9.15 9.15 0 1 0 8.889 0"
				fill="none"
			/>
		</svg>
	)
}

export default IconPowerStroke
