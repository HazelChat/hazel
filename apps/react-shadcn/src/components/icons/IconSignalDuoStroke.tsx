// icons/svgs/duo-stroke/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconSignalDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19.071 4.929c3.905 3.905 3.905 10.237 0 14.142m-14.142 0c-3.905-3.905-3.905-10.237 0-14.142"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15.841 8.158a5.433 5.433 0 0 1 0 7.683m-7.682 0a5.433 5.433 0 0 1 0-7.683"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconSignalDuoStroke
