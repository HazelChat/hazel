// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconSwapArrowHorizontalStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.887 12a20.2 20.2 0 0 0-3.747 3.604A.63.63 0 0 0 3 16m3.887 4a20.2 20.2 0 0 1-3.747-3.604A.63.63 0 0 1 3 16m0 0h14m.113-12a20.2 20.2 0 0 1 3.747 3.604c.093.116.14.256.14.396m-3.887 4a20.2 20.2 0 0 0 3.747-3.604A.63.63 0 0 0 21 8m0 0H7"
				fill="none"
			/>
		</svg>
	)
}

export default IconSwapArrowHorizontalStroke
