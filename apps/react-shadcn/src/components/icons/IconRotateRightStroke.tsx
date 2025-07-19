// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconRotateRightStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17.783 2.67a15 15 0 0 1 1.049 3.726c.049.335-.215.485-.479.586l-.094.035m0 0A8 8 0 1 0 19.748 14m-1.489-6.983a15 15 0 0 1-3.476.85"
				fill="none"
			/>
		</svg>
	)
}

export default IconRotateRightStroke
