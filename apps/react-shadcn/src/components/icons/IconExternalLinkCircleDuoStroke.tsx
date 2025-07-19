// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconExternalLinkCircleDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19.974 13.5A7.11 7.11 0 0 1 12.89 20H12a8 8 0 0 1-8-8v-.889a7.11 7.11 0 0 1 6.5-7.085"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19.76 9.455c.262-1.633.31-3.285.142-4.914a.5.5 0 0 0-.142-.3m0 0a.5.5 0 0 0-.301-.143 18.8 18.8 0 0 0-4.913.142m5.214 0L10 14"
				fill="none"
			/>
		</svg>
	)
}

export default IconExternalLinkCircleDuoStroke
