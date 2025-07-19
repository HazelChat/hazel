// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowBigLeft: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M9.21 4.195a1 1 0 0 1 1.587.92Q10.631 6.554 10.533 8h8.896c.253 0 .5 0 .707.017.268.015.53.084.77.201a2 2 0 0 1 .874.874c.117.241.185.503.2.77.018.208.018.454.018.706v2.864c0 .252 0 .498-.017.706-.015.268-.084.53-.2.77a2 2 0 0 1-.875.874 2 2 0 0 1-.77.201c-.209.017-.455.017-.708.017h-8.895q.098 1.446.264 2.885a1 1 0 0 1-1.588.92 36.3 36.3 0 0 1-6.744-6.487 2.11 2.11 0 0 1 0-2.636A36.3 36.3 0 0 1 9.21 4.195Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowBigLeft
