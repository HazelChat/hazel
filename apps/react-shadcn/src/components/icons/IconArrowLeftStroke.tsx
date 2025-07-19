// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowLeftStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.83 6a30.2 30.2 0 0 0-5.62 5.406A.95.95 0 0 0 4 12m5.83 6a30.2 30.2 0 0 1-5.62-5.406A.95.95 0 0 1 4 12m0 0h16"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowLeftStroke
