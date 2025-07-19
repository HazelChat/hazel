// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconUturnLeftStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.03 3.916a20.8 20.8 0 0 0-3.885 3.679.64.64 0 0 0-.145.404m4.03 4.084a20.8 20.8 0 0 1-3.885-3.68A.64.64 0 0 1 4 8m0 0h11a5 5 0 1 1 0 10h-3"
				fill="none"
			/>
		</svg>
	)
}

export default IconUturnLeftStroke
