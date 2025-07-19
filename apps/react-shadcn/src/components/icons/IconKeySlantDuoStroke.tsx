// icons/svgs/duo-stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconKeySlantDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m15.768 7.171 2.829-2.828 2.12 2.121m-4.949.707-5.657 5.657m5.657-5.657 1.414 1.415"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4.454 18.485a4 4 0 1 0 5.657-5.657 4 4 0 0 0-5.657 5.657Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconKeySlantDuoStroke
