// icons/svgs/duo-stroke/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconCreditCardArrowRepeatDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.379 20c-2.226 0-3.342-.001-4.195-.436a4 4 0 0 1-1.748-1.748C2 16.96 2 15.84 2 13.6v-3.2c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C5.04 4 6.16 4 8.4 4h7.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C22 7.04 22 8.16 22 10.4v1.184"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M2 9h20M6 13h3m13.295 2.57a10 10 0 0 1-.672 2.363.47.47 0 0 1-.455.286m-2.403-.768c.745.349 1.53.604 2.336.76l.067.008m-5.565 1.463a10 10 0 0 0-2.4-.704m-1.079 2.677c.105-.816.31-1.615.61-2.38a.47.47 0 0 1 .469-.297m7.965-.759a4 4 0 0 0-6.524-2.714m-1.441 3.473q.04.411.167.82a4 4 0 0 0 6.366 1.88"
				fill="none"
			/>
		</svg>
	)
}

export default IconCreditCardArrowRepeatDuoStroke
