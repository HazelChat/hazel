// icons/svgs/duo-solid/food

import type React from "react"
import type { SVGProps } from "react"

export const IconChefHatDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 2a5 5 0 0 0-4.584 3A5.5 5.5 0 0 0 6 15.794v2.843c0 .39 0 .74.024 1.03.025.313.083.644.248.969a2.5 2.5 0 0 0 1.093 1.092c.325.166.656.224.968.25.292.023.642.023 1.03.023h5.273c.39 0 .74 0 1.03-.024.313-.025.644-.083.969-.248a2.5 2.5 0 0 0 1.092-1.093 2.5 2.5 0 0 0 .25-.968c.023-.292.023-.642.023-1.03v-2.844A5.502 5.502 0 0 0 16.584 5 5 5 0 0 0 12 2Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10 17h4m-4 0v-3m0 3H7m7 0v-5m0 5h3"
			/>
		</svg>
	)
}

export default IconChefHatDuoSolid
