// icons/svgs/duo-stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconEye02OffDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3 14c0-2.187 2.7-7 9-7 1.623 0 3.008.32 4.169.831m3.222 2.434C20.49 11.598 21 13.048 21 14m-8.129-2.871a3 3 0 0 0-3.743 3.743m3.623 2.033a3 3 0 0 0 2.154-2.154"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M22 2 2 22"
				fill="none"
			/>
		</svg>
	)
}

export default IconEye02OffDuoStroke
