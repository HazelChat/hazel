// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconDivertRightDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m1 9 6.879 6.879a3 3 0 0 0 4.242 0L17.5 10.5"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M13.835 7.302a21.8 21.8 0 0 1 5.604-.21 1.624 1.624 0 0 1 1.47 1.469c.172 1.858.1 3.742-.211 5.604a1 1 0 0 1-1.767.46l-.88-1.1a23 23 0 0 0-3.576-3.575l-1.1-.88a1 1 0 0 1 .46-1.768Z"
			/>
		</svg>
	)
}

export default IconDivertRightDuoSolid
