// icons/svgs/contrast/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconAmieSo1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M8.21 21c1.494 0 2.84-.628 3.79-1.634A5.21 5.21 0 1 0 19.366 12 5.21 5.21 0 1 0 12 4.634 5.21 5.21 0 1 0 4.634 12a5.21 5.21 0 0 0 3.576 9Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8.21 21c1.494 0 2.84-.628 3.79-1.634A5.21 5.21 0 1 0 19.366 12 5.21 5.21 0 1 0 12 4.634 5.21 5.21 0 1 0 4.634 12a5.21 5.21 0 0 0 3.576 9Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11 14v-4a1 1 0 1 1 2 0v4a1 1 0 1 1-2 0Z"
			/>
		</svg>
	)
}

export default IconAmieSo1
