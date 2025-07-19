// icons/svgs/stroke/ai

import type React from "react"
import type { SVGProps } from "react"

export const IconCodeAiStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.466 4.188c-1.657 0-3 1.194-3 2.667V9.52c0 1.473-1.343 2.667-3 2.667 1.657 0 3 1.194 3 2.667v2.666c0 1.473 1.343 2.667 3 2.667m8-16c1.657 0 3 1.194 3 2.667V9.52c0 1.473 1.343 2.667 3 2.667-1.657 0-3 1.194-3 2.667v2.666c0 1.473-1.343 2.667-3 2.667M8.966 16zm4-7c-.638 1.617-1.34 2.345-3 3 1.66.655 2.362 1.383 3 3 .637-1.617 1.338-2.345 3-3-1.662-.655-2.363-1.383-3-3Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCodeAiStroke
