// icons/svgs/stroke/time

import type React from "react"
import type { SVGProps } from "react"

export const IconAlarmOffStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5 3 2 6m12.283 9.37.217.13m4.984-5.332A8 8 0 0 1 9.168 20.484m-3.303-2.35a8 8 0 0 1 11.27-11.27m-11.27 11.27L2 22m3.865-3.865L12 12m0 0v-2m0 2 5.135-5.135m0 0L20 4m2-2-2 2m0 0-1-1"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlarmOffStroke
