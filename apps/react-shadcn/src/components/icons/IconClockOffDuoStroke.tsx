// icons/svgs/duo-stroke/time

import type React from "react"
import type { SVGProps } from "react"

export const IconClockOffDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 8v4m6.47-6.47A9.15 9.15 0 0 0 5.53 18.47m3.475 2.179A9.15 9.15 0 0 0 20.648 9.006m-5.86 5.86.211.134"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M22 2 2 22"
				fill="none"
			/>
		</svg>
	)
}

export default IconClockOffDuoStroke
