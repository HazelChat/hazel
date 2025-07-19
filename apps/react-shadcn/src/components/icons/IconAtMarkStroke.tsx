// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconAtMarkStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16 8v5.5a2.5 2.5 0 0 0 2.5 2.5c2.18 0 2.5-2.267 2.5-4a9 9 0 1 0-9 9c1.052 0 2.062-.18 3-.512M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAtMarkStroke
