// icons/svgs/duo-stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconCleanBroomDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10.722 12.465c-2.107 2.4-4.574 4.43-7.293 6.145-1.93 1.216 3.249 1.903 3.71 1.972M19 14.61c.028 1.769-.382 3.482-1.168 5.13-.657 1.379-3.696 1.264-5.336 1.254m-5.356-.412c1.773.263 3.563.401 5.356.412m-5.356-.412c1.14-.587 3.145-2.27 4.599-4.308m.757 4.72c.635-.687 1.976-2.296 2.72-3.7"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15.626 10.337 18.65 3m-3.024 7.337c1.275.322 2.876.817 3.175 2.379q.183.957.198 1.894l-8.277-2.145c1.588-1.81 2.254-2.798 4.904-2.128Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCleanBroomDuoStroke
