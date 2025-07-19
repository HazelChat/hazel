// icons/svgs/duo-stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconScissorsDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.4 3 12 11.4m0 0L3.6 3m8.4 8.4 3.454 3.454M12 11.4l-3.455 3.454"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14.4 17.4a3.6 3.6 0 1 1 7.2 0 3.6 3.6 0 0 1-7.2 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 13.8A3.6 3.6 0 1 1 6 21a3.6 3.6 0 0 1 0-7.2Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconScissorsDuoStroke
