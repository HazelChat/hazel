// icons/svgs/duo-stroke/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconCurrencySignDollarDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 3v18"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17 7.5c-.37-1.553-1.675-2.7-3.228-2.7h-3.439C8.493 4.8 7 6.412 7 8.4S8.492 12 10.333 12h3.334C15.507 12 17 13.612 17 15.6s-1.492 3.6-3.333 3.6h-3.439C8.675 19.2 7.37 18.053 7 16.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconCurrencySignDollarDuoStroke
