// icons/svgs/stroke/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconMapPinAreaStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3.518 17C2.556 17.502 2 18.096 2 18.732 2 20.537 6.477 22 12 22s10-1.463 10-3.268c0-.636-.556-1.23-1.518-1.732m-5.956-8.263a2.526 2.526 0 1 1-5.052 0 2.526 2.526 0 0 1 5.052 0Zm4.21.374C18.737 14.444 13.685 18 12 18s-6.737-3.556-6.737-8.889S9.473 2 12 2c2.526 0 6.737 1.778 6.737 7.111Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMapPinAreaStroke
