// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconChevronDown1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.702 13.894A20.4 20.4 0 0 1 8 10l4 .304L16 10a20.4 20.4 0 0 1-3.702 3.894.47.47 0 0 1-.596 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11.702 13.894A20.4 20.4 0 0 1 8 10l4 .304L16 10a20.4 20.4 0 0 1-3.702 3.894.47.47 0 0 1-.596 0Z"
			/>
		</svg>
	)
}

export default IconChevronDown1
