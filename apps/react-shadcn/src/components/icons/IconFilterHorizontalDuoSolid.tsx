// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFilterHorizontalDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3 7h7m6 10h5M20 7h1M3 17h3"
				opacity=".28"
			/>
			<path fill="currentColor" d="M13 3a4 4 0 0 0 0 8h1a4 4 0 0 0 0-8z" />
			<path fill="currentColor" d="M9 13a4 4 0 0 0 0 8h1a4 4 0 0 0 0-8z" />
		</svg>
	)
}

export default IconFilterHorizontalDuoSolid
