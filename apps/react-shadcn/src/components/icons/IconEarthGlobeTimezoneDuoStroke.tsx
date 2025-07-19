// icons/svgs/duo-stroke/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconEarthGlobeTimezoneDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13.919 3.052A9.15 9.15 0 0 1 21.149 12c0 .861-.118 1.694-.34 2.484M3.461 8.702a9.15 9.15 0 0 0 11.022 12.106"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18 16.5v2h1.5M12 2.85q.989.002 1.919.202.08.464.08.948c0 2.429-1.563 4.52-3.811 5.465a3.12 3.12 0 0 1-.426 2.865 1.742 1.742 0 1 1-2.757 1.27A3.117 3.117 0 0 1 4.38 9.265a6.6 6.6 0 0 1-.917-.563A9.15 9.15 0 0 1 12 2.85ZM22.5 18a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconEarthGlobeTimezoneDuoStroke
