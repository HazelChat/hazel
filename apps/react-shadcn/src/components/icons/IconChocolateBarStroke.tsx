// icons/svgs/stroke/food

import type React from "react"
import type { SVGProps } from "react"

export const IconChocolateBarStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19 15V8a3 3 0 0 1-2.97-2.578h-.073A5 5 0 0 1 11.211 2H7.5A2.5 2.5 0 0 0 5 4.5V15m14 0v4.5a2.5 2.5 0 0 1-2.5 2.5H12m7-7H5m7 7H7.5A2.5 2.5 0 0 1 5 19.5V15m7 7V3.48M5 9h14"
				fill="none"
			/>
		</svg>
	)
}

export default IconChocolateBarStroke
