// icons/svgs/stroke/maths

import type React from "react"
import type { SVGProps } from "react"

export const IconEqualsCancelStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.333 9 19 3m-4.667 6H5m9.333 0-4.666 6M15 15h4m-.02-6H19M5 21l4.667-6m0 0H5"
				fill="none"
			/>
		</svg>
	)
}

export default IconEqualsCancelStroke
