// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconChevronSortVerticalStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16 9a20.4 20.4 0 0 0-3.702-3.894.47.47 0 0 0-.596 0A20.4 20.4 0 0 0 8 9m0 6a20.4 20.4 0 0 0 3.702 3.894c.175.141.42.141.596 0A20.4 20.4 0 0 0 16 15"
				fill="none"
			/>
		</svg>
	)
}

export default IconChevronSortVerticalStroke
