// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconAlignLeftDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 5v14"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12.03 7.917a20.8 20.8 0 0 0-3.885 3.679A.64.64 0 0 0 8 12m4.03 4.083a20.8 20.8 0 0 1-3.885-3.678A.64.64 0 0 1 8 12m0 0h12"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlignLeftDuoStroke
