// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowRightUp: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m17.515 14.9-3.325-3.676-8.074 8.074a1 1 0 0 1-1.414-1.414l8.074-8.074-3.675-3.325a1 1 0 0 1 .522-1.73 31.2 31.2 0 0 1 8.055-.158 1.95 1.95 0 0 1 1.725 1.725 31.2 31.2 0 0 1-.157 8.054 1 1 0 0 1-1.73.523Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowRightUp
