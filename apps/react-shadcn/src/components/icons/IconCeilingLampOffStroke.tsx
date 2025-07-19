// icons/svgs/stroke/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconCeilingLampOffStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 7a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9Zm0 0V4m3 12a3 3 0 1 1-6 0z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCeilingLampOffStroke
