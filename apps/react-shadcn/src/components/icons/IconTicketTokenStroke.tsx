// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconTicketTokenStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10 6.102V4m0 5.401v1m0 3.3v1M10 18v2m0-16H6a4 4 0 0 0-4 4v.4a.6.6 0 0 0 .6.6A2.4 2.4 0 0 1 5 11.4v1.2A2.4 2.4 0 0 1 2.6 15a.6.6 0 0 0-.6.6v.4a4 4 0 0 0 4 4h4m0-16h8a4 4 0 0 1 4 4v.4a.6.6 0 0 1-.6.6 2.4 2.4 0 0 0-2.4 2.4v1.2a2.4 2.4 0 0 0 2.4 2.4.6.6 0 0 1 .6.6v.4a4 4 0 0 1-4 4h-8"
				fill="none"
			/>
		</svg>
	)
}

export default IconTicketTokenStroke
