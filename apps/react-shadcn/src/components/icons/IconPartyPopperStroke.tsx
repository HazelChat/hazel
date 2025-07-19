// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconPartyPopperStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.125 17.966c.263-.007.476-.082.625-.23.78-.782-.486-3.314-2.829-5.657S7.046 8.469 6.264 9.25c-.149.15-.223.362-.23.625m8.09 8.09c-1.115.03-3.135-1.162-5.031-3.058s-3.087-3.916-3.059-5.032m8.09 8.09C13 19 4.325 22.594 2.882 21.088 1.434 19.575 5 11 6.034 9.875M6 5h.01M14 4h.01M9.467 2c1.248 1.535 1.662 3.614 1.033 5.5M17 15c1.966-.28 3.904.173 5 2m0-12.65c-3.378 1.013-6.354 2.789-8.5 5.65m2.5 2h.01M18 19h.01M21 10h.01"
				fill="none"
			/>
		</svg>
	)
}

export default IconPartyPopperStroke
