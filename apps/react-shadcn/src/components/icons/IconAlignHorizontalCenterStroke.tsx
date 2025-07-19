// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconAlignHorizontalCenterStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17.316 9a16.4 16.4 0 0 0-3.197 2.703A.44.44 0 0 0 14 12m3.316 3a16.4 16.4 0 0 1-3.197-2.703A.44.44 0 0 1 14 12m0 0h7M6.684 15a16.4 16.4 0 0 0 3.197-2.703A.44.44 0 0 0 10 12M6.684 9a16.4 16.4 0 0 1 3.197 2.703A.44.44 0 0 1 10 12m0 0H3m9-7v14"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlignHorizontalCenterStroke
