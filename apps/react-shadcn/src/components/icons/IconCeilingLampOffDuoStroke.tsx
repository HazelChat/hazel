// icons/svgs/duo-stroke/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconCeilingLampOffDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15 16H9m-6 0a9 9 0 1 1 18 0z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M13 4a1 1 0 0 0-2 0v2.05a10 10 0 0 1 2 0z" />
			<path fill="currentColor" d="M8.126 17a4.002 4.002 0 0 0 7.748 0h-2.142a2 2 0 0 1-3.464 0z" />
		</svg>
	)
}

export default IconCeilingLampOffDuoStroke
