// icons/svgs/duo-stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconGoogleDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18.054 4.518A9.4 9.4 0 0 0 12.69 2.85c-5.147 0-9.44 3.931-9.44 9.15 0 5.053 4.183 9.1 9.44 9.1 5.364 0 8.807-4.126 8.546-9.1"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M21.236 12H12.69"
				fill="none"
			/>
		</svg>
	)
}

export default IconGoogleDuoStroke
