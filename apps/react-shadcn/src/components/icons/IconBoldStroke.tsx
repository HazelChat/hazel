// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconBoldStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7 12V5.773c0-.255 0-.382.045-.48a.5.5 0 0 1 .247-.248C7.392 5 7.518 5 7.772 5H12a3.5 3.5 0 0 1 3.5 3.5c0 1.935-1.615 3.5-3.535 3.5M7 12v6.2c0 .28 0 .42.054.527a.5.5 0 0 0 .219.218C7.38 19 7.52 19 7.8 19h5.7a3.5 3.5 0 1 0 0-7h-1.535M7 12h4.965"
				fill="none"
			/>
		</svg>
	)
}

export default IconBoldStroke
