// icons/svgs/stroke/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconMouseButtonRightStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 3a7 7 0 0 0-7 7v4a7 7 0 1 0 14 0v-4a7 7 0 0 0-7-7Zm0 0v4.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C13.52 11 14.08 11 15.2 11H19"
				fill="none"
			/>
		</svg>
	)
}

export default IconMouseButtonRightStroke
