// icons/svgs/stroke/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconCurrencySignPoundStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16 20H6.25c-.263 0-.347-.38-.112-.505a4.55 4.55 0 0 0 2.38-4.02V12.89m0 0V8c0-2.272 1.773-4 3.851-4C14.328 4 16 5.62 16 7.765m-7.482 5.124H6.025m2.493 0H16"
				fill="none"
			/>
		</svg>
	)
}

export default IconCurrencySignPoundStroke
