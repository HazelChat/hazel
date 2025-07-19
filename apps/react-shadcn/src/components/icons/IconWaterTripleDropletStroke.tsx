// icons/svgs/stroke/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconWaterTripleDropletStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 2.056c6.262 5.704 2.752 9.333 0 9.333s-6.262-3.63 0-9.333Zm-6 10.21C12.262 17.97 8.752 21.6 6 21.6s-6.262-3.63 0-9.333Zm12 0c6.262 5.703 2.752 9.333 0 9.333s-6.262-3.63 0-9.333Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconWaterTripleDropletStroke
