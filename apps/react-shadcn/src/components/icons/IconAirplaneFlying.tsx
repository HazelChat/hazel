// icons/svgs/solid/automotive

import type React from "react"
import type { SVGProps } from "react"

export const IconAirplaneFlying: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5.178 3.43A1 1 0 0 1 6 3h.639a4 4 0 0 1 3.01 1.366L15.454 11H18a4 4 0 0 1 4 4 2 2 0 0 1-2 2H6.162a4 4 0 0 1-3.794-2.735L1.05 10.316A1 1 0 0 1 2 9h.697a2 2 0 0 1 1.11.336L6.303 11h1.254L5.064 4.351a1 1 0 0 1 .114-.921ZM3 19a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconAirplaneFlying
