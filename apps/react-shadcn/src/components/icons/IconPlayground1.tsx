// icons/svgs/contrast/sports

import type React from "react"
import type { SVGProps } from "react"

export const IconPlayground1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 16V8a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M2 9h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H2m20-6h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2m-10 0v4m0-4a3 3 0 1 1 0-6m0 6a3 3 0 1 0 0-6m0 0V5M2 8v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3Z"
			/>
		</svg>
	)
}

export default IconPlayground1
