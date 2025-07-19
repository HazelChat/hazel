// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconChevronDownStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8 10.14a20.4 20.4 0 0 0 3.702 3.893c.175.141.42.141.596 0A20.4 20.4 0 0 0 16 10.14"
				fill="none"
			/>
		</svg>
	)
}

export default IconChevronDownStroke
