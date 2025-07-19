// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconThermometerUp1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M18 5a3 3 0 1 0-6 0v10.354a4 4 0 1 0 6 0z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18 5a3 3 0 1 0-6 0v10.354a4 4 0 1 0 6 0z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 0v-7"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.572 8.41a13 13 0 0 0-2.19-2.274A.6.6 0 0 0 5 6M2.428 8.41a13 13 0 0 1 2.193-2.274A.6.6 0 0 1 5 6m0 0v6.429"
			/>
		</svg>
	)
}

export default IconThermometerUp1
