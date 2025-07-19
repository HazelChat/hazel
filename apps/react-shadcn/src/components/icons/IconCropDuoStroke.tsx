// icons/svgs/duo-stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconCropDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 18h4v4M18 2v4h4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.092 6.218C7.52 6 8.08 6 9.2 6H18v8.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C16.48 18 15.92 18 14.8 18H6V9.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCropDuoStroke
