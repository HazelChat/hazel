// icons/svgs/duo-stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconPatreonOldLogoDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5 4.5c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54C5.801 3 6.034 3 6.5 3s.699 0 .883.076a1 1 0 0 1 .54.541C8 3.801 8 4.034 8 4.5v15c0 .466 0 .699-.076.883a1 1 0 0 1-.541.54C7.199 21 6.966 21 6.5 21s-.699 0-.883-.076a1 1 0 0 1-.54-.541C5 20.199 5 19.966 5 19.5z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11 8.15a5.15 5.15 0 1 1 10.3 0 5.15 5.15 0 0 1-10.3 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPatreonOldLogoDuoStroke
