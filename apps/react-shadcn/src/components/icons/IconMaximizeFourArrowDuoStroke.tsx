// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMaximizeFourArrowDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.667 19.744c1.58.264 3.178.324 4.753.179a.555.555 0 0 0 .503-.503 18.5 18.5 0 0 0-.18-4.753M4.258 9.333a18.5 18.5 0 0 1-.18-4.753.555.555 0 0 1 .503-.503 18.5 18.5 0 0 1 4.753.18"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9.333 19.744a18.5 18.5 0 0 1-4.753.179.555.555 0 0 1-.503-.503 18.5 18.5 0 0 1 .18-4.753m10.41-10.41a18.5 18.5 0 0 1 4.753-.18.555.555 0 0 1 .503.503 18.5 18.5 0 0 1-.18 4.753"
				fill="none"
			/>
		</svg>
	)
}

export default IconMaximizeFourArrowDuoStroke
