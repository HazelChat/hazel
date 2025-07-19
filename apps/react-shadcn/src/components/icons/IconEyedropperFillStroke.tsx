// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconEyedropperFillStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15.26 12.045a34 34 0 0 1 1.663 2.144c.11.155.334.173.468.039l1.275-1.274a1.834 1.834 0 0 0 0-2.595l-.825-.824 1.415-1.414a3 3 0 1 0-4.243-4.243l-1.414 1.414-.825-.824a1.834 1.834 0 0 0-2.594 0L8.906 5.743a.308.308 0 0 0 .039.468 34 34 0 0 1 2.066 1.598m4.249 4.236a34.3 34.3 0 0 0-4.25-4.235m4.249 4.236L13.306 14M11.01 7.81 4.82 14m0 0-.28.28c-.368.368-.552.552-.679.763a2 2 0 0 0-.283.934c-.011.246.04.5.142 1.01a.7.7 0 0 1-.024.384l-.492 1.476c-.163.488-.244.732-.186.895a.5.5 0 0 0 .303.303c.162.058.406-.024.895-.186l1.475-.492a.7.7 0 0 1 .384-.024c.51.102.765.153 1.01.141a2 2 0 0 0 .935-.283c.21-.127.394-.31.762-.678L13.306 14M4.82 14h8.486"
				fill="none"
			/>
		</svg>
	)
}

export default IconEyedropperFillStroke
