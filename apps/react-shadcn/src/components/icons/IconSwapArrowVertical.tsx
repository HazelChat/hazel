// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconSwapArrowVertical: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.804 17.708a1 1 0 0 0-.878-1.592l-2.223.165q-.352.026-.703.041V7a1 1 0 1 0-2 0v9.322q-.351-.015-.703-.041l-2.223-.165a1 1 0 0 0-.878 1.592 21.2 21.2 0 0 0 3.783 3.933 1.63 1.63 0 0 0 2.042 0 21.2 21.2 0 0 0 3.783-3.933Z"
				fill="currentColor"
			/>
			<path
				d="M11.926 7.884a1 1 0 0 0 .878-1.592A21.2 21.2 0 0 0 9.021 2.36a1.63 1.63 0 0 0-2.042 0 21.2 21.2 0 0 0-3.783 3.933 1 1 0 0 0 .878 1.592l2.223-.165q.352-.026.703-.041V17a1 1 0 1 0 2 0V7.678q.351.015.703.041z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSwapArrowVertical
