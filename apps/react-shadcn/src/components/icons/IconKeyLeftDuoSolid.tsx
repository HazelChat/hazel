// icons/svgs/duo-solid/security

import type React from "react"
import type { SVGProps } from "react"

export const IconKeyLeftDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 12H2v3m4-3h8m-8 0v2"
				opacity=".28"
			/>
			<path fill="currentColor" d="M18 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
		</svg>
	)
}

export default IconKeyLeftDuoSolid
