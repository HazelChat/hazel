// icons/svgs/stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconHashtagStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m7 20 .938-5m0 0 1.125-6m-1.126 6h7m-7 0H3.5m5.563-6L10 4m-.937 5h7m-7 0H4.5M14 20l.938-5m0 0 1.124-6m-1.125 6H19.5m-3.437-6L17 4m-.937 5H20.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconHashtagStroke
