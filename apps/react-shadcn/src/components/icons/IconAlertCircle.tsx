// icons/svgs/solid/alerts

import type React from "react"
import type { SVGProps } from "react"

export const IconAlertCircle: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11 4za1 1 0 1 0-2 0v0a1 1 0 1 0 2 0Zm0-3.376v-4a1 1 0 1 0-2 0v4a1 1 0 0 0 2 0Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconAlertCircle
