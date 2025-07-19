// icons/svgs/stroke/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconMacFinderStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7 8v1m10-1v1m0 7a9.5 9.5 0 0 1-5 1.429A9.5 9.5 0 0 1 7 16m6.176-13A23.9 23.9 0 0 0 11 13h4c0 2.782.209 5.475.662 7.994M13.176 3H10c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 2.545 5.73C2 6.8 2 8.2 2 11v2c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C5.8 21 7.2 21 10 21h4c.618 0 1.168 0 1.662-.006M13.176 3H14c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C22 6.8 22 8.2 22 11v2c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185c-.833.425-1.867.518-3.608.54"
				fill="none"
			/>
		</svg>
	)
}

export default IconMacFinderStroke
