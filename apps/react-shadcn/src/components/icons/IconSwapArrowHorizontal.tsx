// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconSwapArrowHorizontal: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17.708 3.196a1 1 0 0 0-1.592.878l.165 2.223q.026.352.041.703H7a1 1 0 0 0 0 2h9.322q-.015.351-.041.703l-.165 2.223a1 1 0 0 0 1.592.878 21.2 21.2 0 0 0 3.933-3.783 1.63 1.63 0 0 0 0-2.042 21.2 21.2 0 0 0-3.933-3.783Z"
				fill="currentColor"
			/>
			<path
				d="M7.884 12.074a1 1 0 0 0-1.592-.878 21.2 21.2 0 0 0-3.933 3.783 1.63 1.63 0 0 0 0 2.042 21.2 21.2 0 0 0 3.933 3.783 1 1 0 0 0 1.592-.878l-.165-2.223A23 23 0 0 1 7.678 17H17a1 1 0 1 0 0-2H7.678q.015-.351.041-.703z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSwapArrowHorizontal
