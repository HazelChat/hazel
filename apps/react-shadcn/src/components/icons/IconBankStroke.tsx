// icons/svgs/stroke/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconBankStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 21h20M4 13v5m5-5v5m6-5v5m5-5v5m2-8H2V9l8.08-6.06c.688-.516 1.033-.775 1.41-.874a2 2 0 0 1 1.02 0c.377.1.722.358 1.41.874L22 9z"
				fill="none"
			/>
		</svg>
	)
}

export default IconBankStroke
