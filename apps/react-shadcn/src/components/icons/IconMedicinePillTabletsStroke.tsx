// icons/svgs/stroke/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconMedicinePillTabletsStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m12.306 15.283 9.39 3.437m-9.39-3.437a5 5 0 0 0 9.39 3.437m-9.39-3.437a5 5 0 0 1 9.39 3.437M2.115 8.056l9.775-2.11m-9.775 2.11a5 5 0 0 0 9.775-2.11m-9.775 2.11a5 5 0 0 1 9.775-2.11"
				fill="none"
			/>
		</svg>
	)
}

export default IconMedicinePillTabletsStroke
