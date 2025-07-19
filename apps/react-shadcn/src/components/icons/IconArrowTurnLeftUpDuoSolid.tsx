// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowTurnLeftUpDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9 9.352V13c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C12.8 21 14.2 21 17 21h3"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M13.83 10.844a1 1 0 0 0 .974-1.58 26.2 26.2 0 0 0-4.684-4.87 1.79 1.79 0 0 0-2.24 0 26.2 26.2 0 0 0-4.684 4.87 1 1 0 0 0 .973 1.58A49 49 0 0 1 6 10.548a23 23 0 0 1 6 0c.443.058.889.134 1.83.296Z"
			/>
		</svg>
	)
}

export default IconArrowTurnLeftUpDuoSolid
