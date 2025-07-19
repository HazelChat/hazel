// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowBigLeftDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.805 5a61 61 0 0 0-.33 4h9.923c.56 0 .84 0 1.053.109a1 1 0 0 1 .438.437c.108.214.108.494.108 1.054v2.8c0 .56 0 .84-.108 1.054a1 1 0 0 1-.437.437c-.214.109-.494.109-1.055.109H9.475q.099 2.005.33 4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9.805 5a35.3 35.3 0 0 0-6.558 6.307 1.11 1.11 0 0 0 0 1.386A35.3 35.3 0 0 0 9.805 19"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowBigLeftDuoStroke
