// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconPaintBrushStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.484 11a7.83 7.83 0 0 1 3.639-4.094l7.27-3.848c.414-.22.862.229.643.643l-3.849 7.27A7.83 7.83 0 0 1 13 14.645m-8.224.627c-.652.79-.413 1.668-.784 2.523A2.05 2.05 0 0 1 2 19.009c1.42 2.468 5.013 2.67 6.721.446.933-1.215 1.402-3.017.13-4.29-1.217-1.216-3.05-1.138-4.075.107Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPaintBrushStroke
