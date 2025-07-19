// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconToggleOn: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M1 12a8 8 0 0 1 8-8h6a8 8 0 0 1 0 16H9a8 8 0 0 1-8-8Zm9 0a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconToggleOn
