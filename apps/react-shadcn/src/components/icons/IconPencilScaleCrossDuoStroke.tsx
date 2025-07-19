// icons/svgs/duo-stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconPencilScaleCrossDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m4.516 13.07 2.851 2.85m-2.851-2.85-.57.57c-.799.798-1.198 1.197-1.347 1.657a2 2 0 0 0 0 1.246c.15.46.548.86 1.347 1.658l1.853 1.853c.798.799 1.198 1.198 1.658 1.347.405.132.84.132 1.246 0 .46-.15.86-.548 1.658-1.347l3.017-3.017M4.516 13.07l2.461-2.46m6.092-6.093 2.138 2.138M13.07 4.516l-2.393 2.393m2.393-2.393.57-.57c.799-.799 1.198-1.198 1.658-1.347a2 2 0 0 1 1.246 0c.46.15.86.548 1.658 1.347l1.853 1.853c.799.798 1.198 1.198 1.347 1.658.132.405.132.84 0 1.246-.15.46-.549.86-1.347 1.658l-2.977 2.977"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3 3.004 5.727 3c.39 0 .584 0 .767.043q.246.06.46.191c.161.1.299.237.574.514l12.973 13.03.061.062a1.6 1.6 0 0 1 .197 1.944 6.3 6.3 0 0 1-1.932 1.965 1.57 1.57 0 0 1-1.964-.212L3.81 7.427c-.266-.267-.398-.4-.495-.555a1.6 1.6 0 0 1-.19-.445c-.045-.177-.05-.365-.059-.742z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPencilScaleCrossDuoStroke
