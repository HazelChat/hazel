// icons/svgs/stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconAnimation02Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 14a5 5 0 0 1 5 5v-1a9 9 0 0 1 5.237-8.178M19 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAnimation02Stroke
