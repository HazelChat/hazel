// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListArrowDown: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M4 5a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2z" fill="currentColor" />
			<path
				d="M20 11.5a1 1 0 0 0-2 0v3.9c-.33-.03-.666-.069-1.017-.11q-.422-.05-.882-.1a1 1 0 0 0-.901 1.596 16 16 0 0 0 2.727 2.83 1.7 1.7 0 0 0 2.146 0 16 16 0 0 0 2.727-2.83 1 1 0 0 0-.9-1.595q-.46.048-.883.099c-.35.041-.686.08-1.017.11z"
				fill="currentColor"
			/>
			<path d="M4 11a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z" fill="currentColor" />
			<path d="M4 17a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z" fill="currentColor" />
		</svg>
	)
}

export default IconListArrowDown
