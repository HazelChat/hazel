// icons/svgs/stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconAnimation01Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15.686 15.017a5.1 5.1 0 0 1-4.771 3.082m4.77-3.082a6.1 6.1 0 1 0-6.702-6.703m6.702 6.703q-.312.033-.635.033a6.1 6.1 0 0 1-6.067-6.736m0 0A5.1 5.1 0 0 0 5.9 13.086m0 0a4.102 4.102 0 0 0 1.05 8.064 4.1 4.1 0 0 0 3.964-3.05M5.9 13.084a5.1 5.1 0 0 0 5.014 5.014"
				fill="none"
			/>
		</svg>
	)
}

export default IconAnimation01Stroke
