// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconToggleOn1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M15 5H9a7 7 0 0 0 0 14h6a7 7 0 1 0 0-14Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15 5H9a7 7 0 0 0 0 14h6a7 7 0 1 0 0-14Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
			/>
		</svg>
	)
}

export default IconToggleOn1
