// icons/svgs/duo-solid/time

import type React from "react"
import type { SVGProps } from "react"

export const IconTimerCheckDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M10 1a1 1 0 0 0 0 2h1v2.055A9.001 9.001 0 0 0 12 23a9 9 0 0 0 1-17.945V3h1a1 1 0 1 0 0-2z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m19.366 5.322 1.06 1.06M9 14.285l2.007 2.005A13.06 13.06 0 0 1 15 12"
			/>
		</svg>
	)
}

export default IconTimerCheckDuoSolid
