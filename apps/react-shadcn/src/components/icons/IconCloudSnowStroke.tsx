// icons/svgs/stroke/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconCloudSnowStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.017 9.026A7 7 0 0 0 6 9.5m.017-.474a4.5 4.5 0 0 0-1.706 8.407m1.706-8.407a6.5 6.5 0 0 1 12.651-1.582 5.501 5.501 0 0 1 .652 9.779M8 15v.01m4 .99v.01M16 15v.01M8 19v.01m4 .99v.01M16 19v.01"
				fill="none"
			/>
		</svg>
	)
}

export default IconCloudSnowStroke
