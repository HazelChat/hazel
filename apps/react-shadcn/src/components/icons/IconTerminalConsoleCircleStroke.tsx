// icons/svgs/stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconTerminalConsoleCircleStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m8 13 2-2-2-2m5 4h3m5-1a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconTerminalConsoleCircleStroke
