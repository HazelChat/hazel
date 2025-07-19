// icons/svgs/stroke/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconCurrencySignYuanStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m5 3 7 8.1m0 0L19 3m-7 8.1v.9m0 0v4m0-4H6m6 0h6m-6 4v5m0-5H6m6 0h6"
				fill="none"
			/>
		</svg>
	)
}

export default IconCurrencySignYuanStroke
