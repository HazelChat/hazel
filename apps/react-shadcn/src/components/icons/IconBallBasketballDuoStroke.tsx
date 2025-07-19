// icons/svgs/duo-stroke/sports

import type React from "react"
import type { SVGProps } from "react"

export const IconBallBasketballDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 21.15a9.15 9.15 0 1 0 0-18.3 9.15 9.15 0 0 0 0 18.3Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5.518 5.542A9.12 9.12 0 0 1 8.188 12m0 0a9.12 9.12 0 0 1-2.67 6.458M8.188 12H2.85m5.337 0H12m6.48-6.458A9.15 9.15 0 0 0 15.813 12m0 0a9.15 9.15 0 0 0 2.669 6.458M15.812 12H12m3.813 0h5.337M12 12V2.85M12 12v9.15"
				fill="none"
			/>
		</svg>
	)
}

export default IconBallBasketballDuoStroke
