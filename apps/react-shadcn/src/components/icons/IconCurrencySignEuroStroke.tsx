// icons/svgs/stroke/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconCurrencySignEuroStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17 5.255A7.002 7.002 0 0 0 6.07 10M17 18.745A7.002 7.002 0 0 1 6.07 14m0-4A7 7 0 0 0 6 11v2q0 .51.07 1m0-4H3m3.07 0H14m-7.93 4H3m3.07 0H13"
				fill="none"
			/>
		</svg>
	)
}

export default IconCurrencySignEuroStroke
