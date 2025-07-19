// icons/svgs/contrast/security

import type React from "react"
import type { SVGProps } from "react"

export const IconEye02Off1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M15.401 13.883A1 1 0 0 1 15.874 15 4 4 0 0 1 13 17.874a1 1 0 0 1-.957-1.676l2.154-2.154a1 1 0 0 1 1.203-.161Z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m22 2-5.831 5.831m0 0L12.87 11.13m3.3-3.3C15.008 7.32 13.623 7 12 7c-6.3 0-9 4.813-9 7m9.872-2.871L9.128 14.87m3.742-3.742a3 3 0 0 0-3.743 3.743m0 0L2 22m17.391-11.735C20.49 11.598 21 13.048 21 14m-8.249 2.905a3 3 0 0 0 2.154-2.154"
			/>
		</svg>
	)
}

export default IconEye02Off1
