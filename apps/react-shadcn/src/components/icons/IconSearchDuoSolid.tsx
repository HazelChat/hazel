// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconSearchDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.95 14.95 21 21"
				opacity=".28"
			/>
			<path fill="currentColor" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" />
		</svg>
	)
}

export default IconSearchDuoSolid
