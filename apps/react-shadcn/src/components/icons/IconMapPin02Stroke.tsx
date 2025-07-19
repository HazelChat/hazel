// icons/svgs/stroke/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconMapPin02Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 0v8"
				fill="none"
			/>
		</svg>
	)
}

export default IconMapPin02Stroke
