// icons/svgs/stroke/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconCreditCardRemoveStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M22 9h-.006m0 0H2.006m19.988 0c.006.413.006.876.006 1.4V15m-.006-6c-.018-1.35-.096-2.16-.43-2.816a4 4 0 0 0-1.748-1.748C18.96 4 17.84 4 15.6 4H8.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748c-.334.655-.412 1.466-.43 2.816m0 0H2m.006 0C2 9.413 2 9.876 2 10.4v3.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C5.04 20 6.16 20 8.4 20h3.768M9 13H6m10 6h6"
				fill="none"
			/>
		</svg>
	)
}

export default IconCreditCardRemoveStroke
