// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconThreeDotsMenuVerticalCircleDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M22.15 12.002c0 5.605-4.544 10.15-10.15 10.15S1.85 17.607 1.85 12.002 6.394 1.852 12 1.852s10.15 4.544 10.15 10.15Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12.005 7.994v.01m0 3.99v.01m0 3.99v.01"
			/>
		</svg>
	)
}

export default IconThreeDotsMenuVerticalCircleDuoSolid
