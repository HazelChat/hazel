// icons/svgs/solid/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconMagneticCompass: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85c5.605 0 10.15 4.544 10.15 10.15S17.605 22.15 12 22.15 1.85 17.606 1.85 12Zm12.53-3.997c.916-.059 1.675.7 1.616 1.616a6.83 6.83 0 0 1-6.377 6.378 1.52 1.52 0 0 1-1.616-1.616 6.83 6.83 0 0 1 6.377-6.378Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMagneticCompass
