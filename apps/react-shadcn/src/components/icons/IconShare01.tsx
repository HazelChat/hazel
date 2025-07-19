// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconShare01: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18 9a4 4 0 0 1-2.969-1.32c-1.968.67-3.744 1.651-5.241 3.037a4 4 0 0 1 0 2.567c1.498 1.385 3.273 2.366 5.241 3.035a4 4 0 1 1-.932 1.793c-1.977-.706-3.82-1.72-5.423-3.139a4 4 0 1 1 0-5.946c1.603-1.418 3.446-2.433 5.423-3.14A4 4 0 1 1 18 9Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconShare01
