// icons/svgs/duo-stroke/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconCurrencySignRubleDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5 16h10"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8 12h6a4 4 0 0 0 0-8h-3.143c-.798 0-1.197 0-1.518.112A2 2 0 0 0 8.112 5.34C8 5.66 8 6.06 8 6.857zm0 0H5m3 0v9"
				fill="none"
			/>
		</svg>
	)
}

export default IconCurrencySignRubleDuoStroke
