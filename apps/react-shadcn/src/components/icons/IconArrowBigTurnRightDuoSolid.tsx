// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowBigTurnRightDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				fillRule="evenodd"
				d="M14.532 8c-3.801 0-6.982.492-9.204 2.209-2.291 1.768-3.331 4.64-3.331 8.791a1 1 0 0 0 1.8.6C6.46 16.05 9.932 16 14.532 16a1 1 0 0 0 .999-.95q.15-3.05 0-6.1a1 1 0 0 0-1-.95Z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M14.797 4.196a1 1 0 0 0-1.59.92 59.8 59.8 0 0 1 0 13.769 1 1 0 0 0 1.588.919 36.3 36.3 0 0 0 6.745-6.485 2.11 2.11 0 0 0 0-2.638 36.3 36.3 0 0 0-6.744-6.485z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconArrowBigTurnRightDuoSolid
