// icons/svgs/solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconMouse: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M4 10a8 8 0 1 1 16 0v4a8 8 0 1 1-16 0zm9-2.05a1 1 0 1 0-2 0v2.1a1 1 0 1 0 2 0z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMouse
