// icons/svgs/solid/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconAcOnSlow: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
			<path d="M8 16a1 1 0 1 0-2 0v2.8a1 1 0 1 0 2 0z" fill="currentColor" />
			<path d="M13 16a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0z" fill="currentColor" />
			<path d="M18 16a1 1 0 1 0-2 0v2.8a1 1 0 1 0 2 0z" fill="currentColor" />
		</svg>
	)
}

export default IconAcOnSlow
