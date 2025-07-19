// icons/svgs/duo-solid/sports

import type React from "react"
import type { SVGProps } from "react"

export const IconTrophyDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17.2 12.996A5 5 0 0 0 22 8V6.6A1.6 1.6 0 0 0 20.4 5h-2.405M6.005 5H3.6A1.6 1.6 0 0 0 2 6.6V8a5 5 0 0 0 4.8 4.996M8 21h4m0 0h4m-4 0v-5"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M8.5 2c-.458 0-.851 0-1.2.083A3 3 0 0 0 5.083 4.3c-.054.226-.07.448-.078.67Q5 5.23 5 5.585V10a7 7 0 0 0 7 7 7 7 0 0 0 7-7V5.586q.001-.356-.005-.617a3.3 3.3 0 0 0-.078-.67A3 3 0 0 0 16.7 2.084C16.351 2 15.958 2 15.5 2.001z"
			/>
		</svg>
	)
}

export default IconTrophyDuoSolid
