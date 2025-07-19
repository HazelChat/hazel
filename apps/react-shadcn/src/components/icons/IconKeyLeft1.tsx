// icons/svgs/contrast/security

import type React from "react"
import type { SVGProps } from "react"

export const IconKeyLeft1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M22 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Zm0 0H2v3m4-3v2"
			/>
		</svg>
	)
}

export default IconKeyLeft1
