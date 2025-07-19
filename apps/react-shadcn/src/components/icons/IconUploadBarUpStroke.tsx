// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconUploadBarUpStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19 20H5M6 9.83a30.2 30.2 0 0 1 5.406-5.62A.95.95 0 0 1 12 4m6 5.83a30.2 30.2 0 0 0-5.406-5.62A.95.95 0 0 0 12 4m0 0v12"
				fill="none"
			/>
		</svg>
	)
}

export default IconUploadBarUpStroke
