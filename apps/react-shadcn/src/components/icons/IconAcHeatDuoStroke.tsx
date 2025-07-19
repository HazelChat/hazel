// icons/svgs/duo-stroke/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconAcHeatDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20 4H4a2 2 0 0 0-2 2v6h20V6a2 2 0 0 0-2-2Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18 8h-2m1.237 7c1.676 1.532 2.579 2.601 2.579 4.421 0 1.39-1.176 2.579-2.58 2.579-1.403 0-2.578-1.19-2.578-2.579 0-.425.16-.845.368-1.105 1.907 1.315 3.48-1.129 2.21-3.316Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAcHeatDuoStroke
