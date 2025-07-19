// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconUturnRightStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15.97 3.916a20.8 20.8 0 0 1 3.885 3.679.64.64 0 0 1 .145.404m-4.03 4.084a20.8 20.8 0 0 0 3.885-3.68A.64.64 0 0 0 20 8m0 0H9a5 5 0 1 0 0 10h3"
				fill="none"
			/>
		</svg>
	)
}

export default IconUturnRightStroke
