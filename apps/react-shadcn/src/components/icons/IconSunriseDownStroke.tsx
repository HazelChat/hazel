// icons/svgs/stroke/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconSunriseDownStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16.004 20.996a5 5 0 1 0-8.012-.007m8.012.007-8.013-.007m8.013.007L21 21m-13.009-.011L3 20.984M9.557 6.71c.602.804 1.302 1.53 2.082 2.162A.57.57 0 0 0 12 9m2.443-2.29a12.2 12.2 0 0 1-2.082 2.162A.57.57 0 0 1 12 9m0 0V3M2 17h1m18 0h1M4.472 10.422l.753.658m14.31-.658-.754.658"
				fill="none"
			/>
		</svg>
	)
}

export default IconSunriseDownStroke
