// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowTurnUpRightStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15.141 4a25.2 25.2 0 0 1 4.684 4.505A.8.8 0 0 1 20 9m-4.859 5a25.2 25.2 0 0 0 4.684-4.505A.8.8 0 0 0 20 9m0 0h-8c-2.8 0-4.2 0-5.27.545a5 5 0 0 0-2.185 2.185C4 12.8 4 14.2 4 17v3"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowTurnUpRightStroke
