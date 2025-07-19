// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconShuffleStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18.189 4c.986.74 1.878 1.599 2.654 2.556.105.13.157.287.157.444m-2.811 3a15 15 0 0 0 2.654-2.556A.7.7 0 0 0 21 7m0 0h-3.876a6 6 0 0 0-4.915 2.56L8.79 14.44A6 6 0 0 1 3.876 17H2m16.189 3a15 15 0 0 0 2.654-2.556A.7.7 0 0 0 21 17m-2.811-3c.986.74 1.878 1.599 2.654 2.556.105.13.157.287.157.444m0 0h-3.876a6 6 0 0 1-3.808-1.363M2 7h1.876a6 6 0 0 1 3.969 1.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconShuffleStroke
