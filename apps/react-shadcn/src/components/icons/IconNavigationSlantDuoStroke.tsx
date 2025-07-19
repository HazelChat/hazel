// icons/svgs/duo-stroke/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconNavigationSlantDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m9.308 12.486-5.84-1.348a.591.591 0 0 1-.183-1.077l.485-.305a51.2 51.2 0 0 1 16.548-6.734.556.556 0 0 1 .66.66 51.2 51.2 0 0 1-6.734 16.548l-.305.485a.592.592 0 0 1-1.077-.183l-1.348-5.84a2.94 2.94 0 0 0-2.206-2.206Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13.939 20.715a.592.592 0 0 1-1.077-.183l-1.348-5.84a2.94 2.94 0 0 0-2.206-2.206l-5.84-1.348a.591.591 0 0 1-.183-1.077"
				fill="none"
			/>
		</svg>
	)
}

export default IconNavigationSlantDuoStroke
