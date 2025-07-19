// icons/svgs/duo-stroke/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconCurrencySignPoundDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.024 12.889H16"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16 20H6.25c-.263 0-.347-.38-.112-.505a4.55 4.55 0 0 0 2.38-4.02V8c0-2.272 1.773-4 3.851-4C14.328 4 16 5.62 16 7.765"
				fill="none"
			/>
		</svg>
	)
}

export default IconCurrencySignPoundDuoStroke
