// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconItalicStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m13.5 5-3 14m3-14H17m-3.5 0H10m.5 14H14m-3.5 0H7"
				fill="none"
			/>
		</svg>
	)
}

export default IconItalicStroke
