// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListHeartDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 12h6m-6 6h6M4 6h16"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17.714 18.327c.372 0 3.715-1.805 3.715-4.333 0-1.264-1.115-2.15-2.229-2.167-.557-.008-1.114.18-1.486.723-.371-.542-.938-.723-1.485-.723-1.115 0-2.229.903-2.229 2.167 0 2.528 3.343 4.333 3.714 4.333Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconListHeartDuoStroke
