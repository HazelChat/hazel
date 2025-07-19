// icons/svgs/stroke/maths

import type React from "react"
import type { SVGProps } from "react"

export const IconPlusStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 19v-7m0 0V5m0 7H5m7 0h7"
				fill="none"
			/>
		</svg>
	)
}

export default IconPlusStroke
