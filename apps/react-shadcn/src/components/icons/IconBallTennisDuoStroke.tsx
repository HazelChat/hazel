// icons/svgs/duo-stroke/sports

import type React from "react"
import type { SVGProps } from "react"

export const IconBallTennisDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.633 20.838a9.13 9.13 0 0 0 7.838-1.502 9.1 9.1 0 0 0 3.368-4.968 9.1 9.1 0 0 0-.433-5.986 9.13 9.13 0 0 0-6.037-5.22 9.13 9.13 0 0 0-7.838 1.503 9.1 9.1 0 0 0-3.368 4.967 9.1 9.1 0 0 0 .433 5.986 9.13 9.13 0 0 0 6.037 5.22Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M20.405 8.382a6.003 6.003 0 0 0-2.935 10.954M6.53 4.665a6.003 6.003 0 0 1-2.934 10.953"
				fill="none"
			/>
		</svg>
	)
}

export default IconBallTennisDuoStroke
