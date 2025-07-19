// icons/svgs/stroke/users

import type React from "react"
import type { SVGProps } from "react"

export const IconIdCardHorizontalStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21 17V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13 10h5m-3 4h3m-8.333 0H7.333C6.597 14 6 14.597 6 15.333c0 .368.298.667.667.667h3.666a.667.667 0 0 0 .667-.667C11 14.597 10.403 14 9.667 14ZM9.5 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconIdCardHorizontalStroke
