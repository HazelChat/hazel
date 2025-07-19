// icons/svgs/solid/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconAcOnFast: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 3a3 3 0 0 0-3 3v6a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V6a3 3 0 0 0-3-3zm11 5a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1Z"
				fill="currentColor"
			/>
			<path
				d="M8 15a1 1 0 1 0-2 0v.146c0 1.677-.947 3.21-2.447 3.96a1 1 0 1 0 .894 1.788A6.43 6.43 0 0 0 8 15.146z"
				fill="currentColor"
			/>
			<path d="M13 15a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0z" fill="currentColor" />
			<path
				d="M18 15a1 1 0 1 0-2 0v.146a6.43 6.43 0 0 0 3.553 5.748 1 1 0 1 0 .894-1.788A4.43 4.43 0 0 1 18 15.146z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconAcOnFast
