// icons/svgs/stroke/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserUser02Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.275 21h9.45A3.275 3.275 0 0 0 20 17.725c0-2.286-2.284-3.869-4.424-3.066l-1.926.722a4.7 4.7 0 0 1-3.3 0l-1.926-.722C6.284 13.856 4 15.44 4 17.725A3.275 3.275 0 0 0 7.275 21Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconUserUser02Stroke
