// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFilterFunnel: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 3a1 1 0 0 0-1 1v2.586A2 2 0 0 0 3.586 8L9 13.414V18a1 1 0 0 0 .4.8l4 3A1 1 0 0 0 15 21v-7.586L20.414 8A2 2 0 0 0 21 6.586V4a1 1 0 0 0-1-1z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconFilterFunnel
