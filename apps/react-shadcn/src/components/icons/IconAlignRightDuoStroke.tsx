// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconAlignRightDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20 5v14"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11.97 7.917a20.8 20.8 0 0 1 3.885 3.679A.64.64 0 0 1 16 12m-4.03 4.083a20.8 20.8 0 0 0 3.885-3.678A.64.64 0 0 0 16 12m0 0H4"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlignRightDuoStroke
