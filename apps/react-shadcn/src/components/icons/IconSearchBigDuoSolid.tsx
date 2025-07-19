// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconSearchBigDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17.51 17.51 21 21"
				opacity=".28"
			/>
			<path fill="currentColor" d="M11.5 2a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Z" />
		</svg>
	)
}

export default IconSearchBigDuoSolid
