// icons/svgs/duo-stroke/food

import type React from "react"
import type { SVGProps } from "react"

export const IconCookieDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16 5v.01m1.025 4.965a5.5 5.5 0 0 1-5.828-6.94 9 9 0 1 0 9.593 10.91 4.5 4.5 0 0 1-3.765-3.97Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8.404 8.193v.01m2.386 9.48v.01M20 5v.01M21 9v.01M9 13.018a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm6.717 1.748a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCookieDuoStroke
