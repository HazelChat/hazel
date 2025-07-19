// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconScissorsRightStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21 20.4 12.6 12m0 0L21 3.6M12.6 12l-3.454 3.455M12.6 12 9.146 8.545m0 6.91a3.6 3.6 0 1 0-5.091 5.091 3.6 3.6 0 0 0 5.09-5.091Zm0-6.91a3.6 3.6 0 1 0-5.091-5.09 3.6 3.6 0 0 0 5.09 5.09Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconScissorsRightStroke
