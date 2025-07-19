// icons/svgs/duo-stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconEncryptedLockDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5 17h6m5-4h3m-7 8h7"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16 9V7a4 4 0 0 0-8 0v2m-3 4h8m-8 8h4m5-4h5"
				fill="none"
			/>
		</svg>
	)
}

export default IconEncryptedLockDuoStroke
