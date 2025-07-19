// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFlag1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19 4.485c0-.89-1.666-.067-2.045.05A6.03 6.03 0 0 1 12 3.904a6.03 6.03 0 0 0-4.955-.633L5.6 3.717a.85.85 0 0 0-.6.813v8.927c0 .756 1.138.173 1.472.06a6.6 6.6 0 0 1 5.377.523 6.6 6.6 0 0 0 5.218.573l1.309-.405A.89.89 0 0 0 19 13.36z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 4.53v8.926M5 4.53a.85.85 0 0 1 .599-.812l1.446-.447A6.03 6.03 0 0 1 12 3.903a6.03 6.03 0 0 0 4.955.633c.379-.118 2.045-.94 2.045-.05v8.874a.89.89 0 0 1-.624.847l-1.31.405a6.6 6.6 0 0 1-5.217-.573 6.6 6.6 0 0 0-5.377-.522c-.334.112-1.472.695-1.472-.06m0-8.928V3m0 10.456V21"
			/>
		</svg>
	)
}

export default IconFlag1
