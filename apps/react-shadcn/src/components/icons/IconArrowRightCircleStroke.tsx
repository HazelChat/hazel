// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowRightCircleStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.052 16a20.3 20.3 0 0 0 3.806-3.604A.63.63 0 0 0 16 12m-3.948-4a20.3 20.3 0 0 1 3.806 3.604A.63.63 0 0 1 16 12m0 0H8m13.15 0a9.15 9.15 0 1 1-18.3 0 9.15 9.15 0 0 1 18.3 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowRightCircleStroke
