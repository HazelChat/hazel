// icons/svgs/stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconShieldRemoveStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9 12h6m-4.25-9.632L5.362 4.314A3 3 0 0 0 3.383 7.02l-.127 3.309A11 11 0 0 0 8.8 20.307l1.52.867a3 3 0 0 0 2.915.032l1.489-.806a11 11 0 0 0 5.728-10.516l-.227-2.95a3 3 0 0 0-1.972-2.592l-5.465-1.974a3 3 0 0 0-2.038 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconShieldRemoveStroke
