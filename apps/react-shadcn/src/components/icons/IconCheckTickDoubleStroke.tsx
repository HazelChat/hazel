// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconCheckTickDoubleStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m2.605 11.781 4.524 5.224.374-.654a26.7 26.7 0 0 1 8.119-8.793l.825-.563m5.106.614-.87.49a26.7 26.7 0 0 0-8.837 8.07l-.428.62-.298-.352"
				fill="none"
			/>
		</svg>
	)
}

export default IconCheckTickDoubleStroke
