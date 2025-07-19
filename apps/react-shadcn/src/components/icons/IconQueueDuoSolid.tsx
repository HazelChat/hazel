// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconQueueDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3 15h18M3 20h18"
				opacity=".28"
			/>
			<path fill="currentColor" d="M6 3a4 4 0 1 0 0 8h12a4 4 0 0 0 0-8z" />
		</svg>
	)
}

export default IconQueueDuoSolid
