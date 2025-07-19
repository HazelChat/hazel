// icons/svgs/stroke/food

import type React from "react"
import type { SVGProps } from "react"

export const IconEggBrokenStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.657 13.676c-1.309-.442-2.24-1.329-2.937-2.44a.06.06 0 0 1 .003-.069l1.813-2.51a.095.095 0 0 0 .003-.109 9.5 9.5 0 0 0-3.093-2.863m0 0C5.72 8.229 4.611 11.748 4.611 14.11a7.389 7.389 0 1 0 14.778 0C19.39 10.031 16.081 2.5 12 2.5c-1.718 0-3.299 1.335-4.554 3.185Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconEggBrokenStroke
