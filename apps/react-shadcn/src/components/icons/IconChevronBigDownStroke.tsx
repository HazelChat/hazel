// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconChevronBigDownStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6 9a30.6 30.6 0 0 0 5.49 5.817c.3.244.72.244 1.02 0A30.6 30.6 0 0 0 18 9"
				fill="none"
			/>
		</svg>
	)
}

export default IconChevronBigDownStroke
