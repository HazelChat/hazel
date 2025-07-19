// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFlagStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5 3v18m1.472-7.483a6.6 6.6 0 0 1 5.377.522 6.6 6.6 0 0 0 5.218.573l1.309-.405A.89.89 0 0 0 19 13.36V4.485c0-.89-1.666-.067-2.045.05A6.03 6.03 0 0 1 12 3.904a6.03 6.03 0 0 0-4.955-.633L5.6 3.717a.85.85 0 0 0-.6.813v8.927c0 .756 1.138.173 1.472.06Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFlagStroke
