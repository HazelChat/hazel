// icons/svgs/duo-stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconFingerprintDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 13v-2.5M12 21v-4m3-13.418A8 8 0 0 0 4 11v6.55M18.615 6.5A7.96 7.96 0 0 1 20 11v6.55"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9.354 8A4 4 0 0 1 16 11v9.25M8 12v8.25"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconFingerprintDuoStroke
