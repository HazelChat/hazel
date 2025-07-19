// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFilterHorizontal: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13 3a4 4 0 0 0-3.874 3H3a1 1 0 0 0 0 2h6.126c.444 1.725 2.01 3 3.874 3h1a4 4 0 0 0 0-8z"
				fill="currentColor"
			/>
			<path d="M20 6a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2z" fill="currentColor" />
			<path
				d="M9 13a4 4 0 0 0-3.874 3H3a1 1 0 1 0 0 2h2.126c.444 1.725 2.01 3 3.874 3h1a4 4 0 0 0 0-8z"
				fill="currentColor"
			/>
			<path d="M16 16a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2z" fill="currentColor" />
		</svg>
	)
}

export default IconFilterHorizontal
