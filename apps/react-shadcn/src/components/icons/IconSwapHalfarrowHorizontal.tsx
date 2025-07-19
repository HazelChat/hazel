// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconSwapHalfarrowHorizontal: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16.63 5.124a1 1 0 0 1 1.078.072 21.2 21.2 0 0 1 3.933 3.783c.238.297.359.659.359 1.021a1 1 0 0 1-1 1H6a1 1 0 1 1 0-2h10.322q-.015-.351-.041-.703l-.165-2.223a1 1 0 0 1 .514-.95Z"
				fill="currentColor"
			/>
			<path
				d="M6.292 18.804a1 1 0 0 0 1.592-.878l-.165-2.223A23 23 0 0 1 7.678 15H18a1 1 0 1 0 0-2H3a1 1 0 0 0-1 1c0 .363.121.724.36 1.021a21.2 21.2 0 0 0 3.932 3.783Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSwapHalfarrowHorizontal
