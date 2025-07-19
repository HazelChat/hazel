// icons/svgs/duo-stroke/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconBatteryThreeCellDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20 14c.465 0 .698 0 .888-.051a1.5 1.5 0 0 0 1.06-1.06C22 12.697 22 12.464 22 12s0-.697-.051-.888a1.5 1.5 0 0 0-1.06-1.06C20.697 10 20.464 10 20 10M8 6h6c1.864 0 2.796 0 3.53.304a4 4 0 0 1 2.165 2.165C20 9.204 20 10.136 20 12s0 2.796-.305 3.53a4 4 0 0 1-2.164 2.165C16.796 18 15.864 18 14 18H8c-1.864 0-2.796 0-3.53-.305a4 4 0 0 1-2.166-2.164C2 14.796 2 13.864 2 12s0-2.796.304-3.53A4 4 0 0 1 4.47 6.303C5.204 6 6.136 6 8 6Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 10v4m5-4v4m5-4v4"
				fill="none"
			/>
		</svg>
	)
}

export default IconBatteryThreeCellDuoStroke
