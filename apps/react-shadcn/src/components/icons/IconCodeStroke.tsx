// icons/svgs/stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconCodeStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17 18a28.2 28.2 0 0 0 4.848-5.49.93.93 0 0 0 0-1.02A28.2 28.2 0 0 0 17 6M7.004 18a28.2 28.2 0 0 1-4.848-5.49.93.93 0 0 1 0-1.02A28.2 28.2 0 0 1 7.004 6m7-1.999-4 16"
				fill="none"
			/>
		</svg>
	)
}

export default IconCodeStroke
