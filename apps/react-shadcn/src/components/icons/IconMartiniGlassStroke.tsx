// icons/svgs/stroke/food

import type React from "react"
import type { SVGProps } from "react"

export const IconMartiniGlassStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 13v8m0-8L6 7m6 6 6-6m-6 14h5.5M12 21H7M6 7 3 4h18l-3 3M6 7c3.993.333 8.007.333 12 0"
				fill="none"
			/>
		</svg>
	)
}

export default IconMartiniGlassStroke
