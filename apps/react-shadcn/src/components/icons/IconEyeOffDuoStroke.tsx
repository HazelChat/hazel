// icons/svgs/duo-stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconEyeOffDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.078 9.578c.6.935.922 1.816.922 2.422 0 2-3.5 7-9 7q-.647 0-1.255-.088m6.548-12.205C15.867 5.712 14.076 5 12 5c-5.5 0-9 5-9 7 0 1.245 1.356 3.653 3.707 5.293M9.88 14.12a3 3 0 1 1 4.243-4.243"
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

export default IconEyeOffDuoStroke
