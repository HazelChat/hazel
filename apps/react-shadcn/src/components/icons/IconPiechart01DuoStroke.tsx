// icons/svgs/duo-stroke/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconPiechart01DuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.335 15.574A9.044 9.044 0 1 1 8.426 3.665"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12.044 10.6V4.27c0-.75.61-1.368 1.351-1.257a9.05 9.05 0 0 1 7.592 7.592c.111.74-.507 1.351-1.256 1.351H13.4c-.75 0-1.357-.607-1.357-1.356Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPiechart01DuoStroke
