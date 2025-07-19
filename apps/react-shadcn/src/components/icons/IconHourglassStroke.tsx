// icons/svgs/stroke/time

import type React from "react"
import type { SVGProps } from "react"

export const IconHourglassStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10.5 12c0-3.52-6.086-3.889-6.486-7.516a2.32 2.32 0 0 1 .683-1.927C5.282 2 6.624 2 9.309 2h5.382c2.685 0 4.027 0 4.612.557a2.32 2.32 0 0 1 .683 1.927C19.586 8.111 13.5 8.481 13.5 12s6.086 3.889 6.486 7.516a2.32 2.32 0 0 1-.683 1.927c-.585.557-1.927.557-4.612.557H9.31c-2.685 0-4.027 0-4.612-.557a2.32 2.32 0 0 1-.683-1.927c.4-3.627 6.486-3.997 6.486-7.516Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconHourglassStroke
