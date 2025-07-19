// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconToggleOff: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M23 12a8 8 0 0 0-8-8H9a8 8 0 1 0 0 16h6a8 8 0 0 0 8-8Zm-9 0a5 5 0 1 0-10 0 5 5 0 0 0 10 0Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconToggleOff
