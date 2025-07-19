// icons/svgs/duo-stroke/food

import type React from "react"
import type { SVGProps } from "react"

export const IconEggBoiledDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 21.5a7.39 7.39 0 0 0 7.39-7.389C19.39 10.031 16.08 2.5 12 2.5s-7.389 7.53-7.389 11.611a7.39 7.39 0 0 0 7.39 7.389Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15.5 14a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconEggBoiledDuoStroke
