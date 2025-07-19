// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconSwapArrowHorizontalDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6.656 16H17m.344-8H7"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M17.708 3.196a1 1 0 0 0-1.592.878l.165 2.223a23 23 0 0 1 0 3.406l-.165 2.223a1 1 0 0 0 1.592.878 21.2 21.2 0 0 0 3.933-3.783 1.63 1.63 0 0 0 0-2.042 21.2 21.2 0 0 0-3.933-3.783Z"
			/>
			<path
				fill="currentColor"
				d="M7.884 12.074a1 1 0 0 0-1.592-.878 21.2 21.2 0 0 0-3.933 3.783 1.63 1.63 0 0 0 0 2.042 21.2 21.2 0 0 0 3.933 3.783 1 1 0 0 0 1.592-.878l-.165-2.223a23 23 0 0 1 0-3.406z"
			/>
		</svg>
	)
}

export default IconSwapArrowHorizontalDuoSolid
