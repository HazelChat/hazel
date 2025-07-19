// icons/svgs/duo-stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconStrikeThroughDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 12c2.271 0 5 .435 5 3.868 0 5.07-8.67 5.506-9.854 1.132M7 8.132C7 3.062 15.67 2.626 16.854 7"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M21 12H3"
				fill="none"
			/>
		</svg>
	)
}

export default IconStrikeThroughDuoStroke
