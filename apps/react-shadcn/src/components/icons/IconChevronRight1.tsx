// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconChevronRight1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.894 11.702A20.4 20.4 0 0 0 10 8l.304 4L10 16a20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13.894 11.702A20.4 20.4 0 0 0 10 8a53 53 0 0 1 0 8 20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596Z"
			/>
		</svg>
	)
}

export default IconChevronRight1
