// icons/svgs/stroke/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconAcOnSlowStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18 8h-2m-4 8v4m5-4v2.8M7 16v2.8M22 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAcOnSlowStroke
