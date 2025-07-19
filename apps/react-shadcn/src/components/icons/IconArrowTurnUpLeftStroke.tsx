// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowTurnUpLeftStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.859 4a25.2 25.2 0 0 0-4.684 4.505A.8.8 0 0 0 4 9m4.859 5a25.2 25.2 0 0 1-4.684-4.505A.8.8 0 0 1 4 9m0 0h8c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C20 12.8 20 14.2 20 17v3"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowTurnUpLeftStroke
