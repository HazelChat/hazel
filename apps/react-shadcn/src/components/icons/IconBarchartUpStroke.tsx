// icons/svgs/stroke/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconBarchartUpStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9 21v-3c0-.932 0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C7.398 15 6.932 15 6 15s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C3 16.602 3 17.068 3 18s0 1.398.152 1.765a2 2 0 0 0 1.083 1.083C4.602 21 5.068 21 6 21zm0 0h6m-6 0v-9c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C10.602 9 11.068 9 12 9s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C15 10.602 15 11.068 15 12v9m0 0h2.8c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C21 19.48 21 18.92 21 17.8V6c0-.932 0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C19.398 3 18.932 3 18 3s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C15 4.602 15 5.068 15 6z"
				fill="none"
			/>
		</svg>
	)
}

export default IconBarchartUpStroke
