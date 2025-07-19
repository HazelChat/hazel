// icons/svgs/duo-solid/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconGaugeLeftUpDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				fillRule="evenodd"
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.605 22.15 12 17.606 1.85 12 1.85Z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m7.996 7.997 4.623 3.468a.833.833 0 0 1 .088 1.243.833.833 0 0 1-1.242-.088z"
			/>
		</svg>
	)
}

export default IconGaugeLeftUpDuoSolid
