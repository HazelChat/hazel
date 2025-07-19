// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconDeleteForwardRightStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m8 15 3-3m0 0 3-3m-3 3L8 9m3 3 3 3m3.375-8.98a33 33 0 0 1 4.419 5.287c.137.203.206.448.206.693s-.069.49-.206.693a33 33 0 0 1-4.42 5.287c-.357.346-.536.518-.784.667a2.7 2.7 0 0 1-.71.287c-.282.066-.561.066-1.119.066H7c-1.4 0-2.1 0-2.635-.273a2.5 2.5 0 0 1-1.093-1.092C3 17.1 3 16.4 3 15V9c0-1.4 0-2.1.272-2.635a2.5 2.5 0 0 1 1.093-1.093C4.9 5 5.6 5 7 5h7.761c.558 0 .837 0 1.119.066.234.055.503.164.71.287.248.149.427.322.785.667Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconDeleteForwardRightStroke
