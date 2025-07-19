// icons/svgs/stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconEncryptedLockStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16 9V7a4 4 0 0 0-8 0v2m-3 4h8m-8 4h6m-6 4h4m7-8h3m-5 4h5m-7 4h7"
				fill="none"
			/>
		</svg>
	)
}

export default IconEncryptedLockStroke
