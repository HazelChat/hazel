// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconAlphabetAbcLowercaseStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.8 13.6a2.4 2.4 0 1 1-4.8 0v-.2a2.4 2.4 0 1 1 4.8 0m0 .2v-.2m0 .2v2.5m0-2.7v-2.5m14.8 4.489a2.4 2.4 0 0 1-4-1.789v-.2a2.4 2.4 0 0 1 4-1.789M9.995 13.4v.2m0-.2a2.4 2.4 0 1 1 4.8 0v.2a2.4 2.4 0 1 1-4.8 0m0-.2V8m0 5.6v2.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlphabetAbcLowercaseStroke
