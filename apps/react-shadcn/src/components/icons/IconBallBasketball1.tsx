// icons/svgs/contrast/sports

import type React from "react"
import type { SVGProps } from "react"

export const IconBallBasketball1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 21.15a9.15 9.15 0 1 0 0-18.3 9.15 9.15 0 0 0 0 18.3Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M21.15 12A9.15 9.15 0 0 1 12 21.15M21.15 12A9.15 9.15 0 0 0 12 2.85M21.15 12H2.85M12 21.15A9.15 9.15 0 0 1 2.85 12M12 21.15V2.85M2.85 12A9.15 9.15 0 0 1 12 2.85M5.518 5.542A9.12 9.12 0 0 1 8.188 12a9.12 9.12 0 0 1-2.67 6.458M18.481 5.542a9.15 9.15 0 0 0 0 12.916"
			/>
		</svg>
	)
}

export default IconBallBasketball1
