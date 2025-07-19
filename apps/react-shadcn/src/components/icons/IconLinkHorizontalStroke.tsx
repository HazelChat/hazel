// icons/svgs/stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconLinkHorizontalStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15 12H9m6-5h1a5 5 0 0 1 0 10h-1M9 7H8a5 5 0 0 0 0 10h1"
				fill="none"
			/>
		</svg>
	)
}

export default IconLinkHorizontalStroke
