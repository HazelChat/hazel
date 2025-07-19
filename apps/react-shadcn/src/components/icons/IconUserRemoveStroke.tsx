// icons/svgs/stroke/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserRemoveStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h3m4 0h6m-5-8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconUserRemoveStroke
