// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconLabFlaskRoundDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10 3h4m-4 0H9m1 0v3.128c0 .674-.458 1.252-1.073 1.529a7.51 7.51 0 0 0-4.354 5.796C12 10 14 17.5 19.486 14.966a7.5 7.5 0 0 0-4.412-7.31C14.457 7.38 14 6.803 14 6.129V3m0 0h1"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9 16h.01M4.5 14.5a7.5 7.5 0 0 0 14.986.466C14 17.5 12 10.002 4.573 13.455A8 8 0 0 0 4.5 14.5Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconLabFlaskRoundDuoStroke
