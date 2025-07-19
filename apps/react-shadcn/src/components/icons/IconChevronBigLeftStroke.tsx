// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconChevronBigLeftStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15 18a30.6 30.6 0 0 1-5.817-5.49.8.8 0 0 1 0-1.02A30.6 30.6 0 0 1 15 6"
				fill="none"
			/>
		</svg>
	)
}

export default IconChevronBigLeftStroke
