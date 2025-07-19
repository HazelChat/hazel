// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFilterVertical1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M17 10a3 3 0 0 1 3 3v1a3 3 0 1 1-6 0v-1a3 3 0 0 1 3-3Z" />
				<path fill="currentColor" d="M7 6a3 3 0 0 1 3 3v1a3 3 0 1 1-6 0V9a3 3 0 0 1 3-3Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17 3v7m0 0a3 3 0 0 0-3 3v1a3 3 0 1 0 6 0v-1a3 3 0 0 0-3-3ZM7 16v5m10-1v1M7 3v3m0 0a3 3 0 0 0-3 3v1a3 3 0 1 0 6 0V9a3 3 0 0 0-3-3Z"
			/>
		</svg>
	)
}

export default IconFilterVertical1
