// icons/svgs/contrast/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconVercel1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeWidth="2"
				d="M11.138 3.465a1 1 0 0 1 1.724 0l8.251 14.028A1 1 0 0 1 20.252 19H3.748a1 1 0 0 1-.862-1.507z"
			/>
			<path
				fill="currentColor"
				d="M11.138 3.466a1 1 0 0 1 1.724 0l8.251 14.027A1 1 0 0 1 20.252 19H3.747a1 1 0 0 1-.862-1.507z"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconVercel1
