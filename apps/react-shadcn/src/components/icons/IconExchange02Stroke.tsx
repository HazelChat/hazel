// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconExchange02Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16.03 5a20.6 20.6 0 0 0-3.885 3.604A.62.62 0 0 0 12 9m4.03 4a20.6 20.6 0 0 1-3.885-3.604A.62.62 0 0 1 12 9m0 0h8M7.97 11a20.6 20.6 0 0 1 3.885 3.604A.62.62 0 0 1 12 15m-4.03 4a20.6 20.6 0 0 0 3.885-3.604A.62.62 0 0 0 12 15m0 0H4"
				fill="none"
			/>
		</svg>
	)
}

export default IconExchange02Stroke
