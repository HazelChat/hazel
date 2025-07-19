// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconAlignBottom1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M11.596 15.855a20.8 20.8 0 0 1-3.68-3.886c2.718.22 5.45.22 8.167 0a20.8 20.8 0 0 1-3.678 3.886.64.64 0 0 1-.81 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 20h14m-7-7.866V4m0 8.134q-2.044 0-4.083-.165a20.8 20.8 0 0 0 3.678 3.886.64.64 0 0 0 .81 0 20.8 20.8 0 0 0 3.678-3.886 51 51 0 0 1-4.083.165Z"
			/>
		</svg>
	)
}

export default IconAlignBottom1
