// icons/svgs/duo-stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconHeadphonesDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3.024 15.669a9.5 9.5 0 0 1-.536-3.157 9.512 9.512 0 0 1 19.024 0 9.5 9.5 0 0 1-.526 3.128"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m19.944 19.277 1.05-3.658a2.378 2.378 0 0 0-4.573-1.31l-1.048 3.657a2.378 2.378 0 1 0 4.571 1.31Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8.627 17.966 7.58 14.308a2.378 2.378 0 1 0-4.572 1.311l1.049 3.658a2.378 2.378 0 0 0 4.571-1.311Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconHeadphonesDuoStroke
