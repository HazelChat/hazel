// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconSwapArrowVerticalDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16 17.344V7m-8-.344V17"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M3.196 6.292a1 1 0 0 0 .878 1.592l2.223-.165a23 23 0 0 1 3.406 0l2.223.165a1 1 0 0 0 .878-1.592A21.2 21.2 0 0 0 9.021 2.36a1.63 1.63 0 0 0-2.042 0 21.2 21.2 0 0 0-3.783 3.933Z"
			/>
			<path
				fill="currentColor"
				d="M12.074 16.116a1 1 0 0 0-.878 1.592 21.2 21.2 0 0 0 3.783 3.933 1.63 1.63 0 0 0 2.042 0 21.2 21.2 0 0 0 3.783-3.933 1 1 0 0 0-.878-1.592l-2.223.165a23 23 0 0 1-3.406 0z"
			/>
		</svg>
	)
}

export default IconSwapArrowVerticalDuoSolid
