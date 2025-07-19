// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowLeftDownStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5.516 9.999a30.2 30.2 0 0 0-.152 7.797.94.94 0 0 0 .272.568m8.365.12a30.2 30.2 0 0 1-7.797.152.95.95 0 0 1-.568-.272m0 0L18.364 5.636"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowLeftDownStroke
