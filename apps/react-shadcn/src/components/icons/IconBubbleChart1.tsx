// icons/svgs/contrast/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconBubbleChart1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path fill="currentColor" d="M20 8.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
				<path fill="currentColor" d="M9 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
				<path fill="currentColor" d="M15.5 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M20 8.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15.5 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
			/>
		</svg>
	)
}

export default IconBubbleChart1
