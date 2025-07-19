// icons/svgs/duo-stroke/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconCurrencySignEuroDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3 10h11M3 14h10"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17 5.255A7 7 0 0 0 6 11v2a7 7 0 0 0 11 5.745"
				fill="none"
			/>
		</svg>
	)
}

export default IconCurrencySignEuroDuoStroke
