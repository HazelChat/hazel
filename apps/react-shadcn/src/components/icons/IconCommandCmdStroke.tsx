// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconCommandCmdStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.333 14.667H6.667a2.667 2.667 0 1 0 2.666 2.666zm0 0h5.334m-5.334 0V9.333m5.334 5.334h2.666a2.667 2.667 0 1 1-2.666 2.666zm0 0V9.333m0 0V6.667a2.667 2.667 0 1 1 2.666 2.666zm0 0H9.333m0 0H6.667a2.667 2.667 0 1 1 2.666-2.666z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCommandCmdStroke
