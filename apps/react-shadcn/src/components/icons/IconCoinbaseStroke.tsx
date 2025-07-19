// icons/svgs/stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconCoinbaseStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.25 12a3.75 3.75 0 0 0 7.118 1.65h5.481a9 9 0 1 1 0-3.3h-5.48A3.75 3.75 0 0 0 8.25 12Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCoinbaseStroke
