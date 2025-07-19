// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFilterFunnelDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M4 3a1 1 0 0 0-1 1v2.586A2 2 0 0 0 3.586 8L9 13.414V18a1 1 0 0 0 .4.8l4 3A1 1 0 0 0 15 21v-7.586L20.414 8A2 2 0 0 0 21 6.586V4a1 1 0 0 0-1-1z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m14.293 12.707 5.414-5.414A1 1 0 0 0 20 6.586V4H4v2.586a1 1 0 0 0 .293.707l5.414 5.414"
			/>
		</svg>
	)
}

export default IconFilterFunnelDuoSolid
