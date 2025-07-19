// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconSearchBigZoomInStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17.51 17.51A8.5 8.5 0 1 0 5.49 5.49a8.5 8.5 0 0 0 12.02 12.02Zm0 0L21 21m-9.5-6.5v-3m0 0v-3m0 3h-3m3 0h3"
				fill="none"
			/>
		</svg>
	)
}

export default IconSearchBigZoomInStroke
