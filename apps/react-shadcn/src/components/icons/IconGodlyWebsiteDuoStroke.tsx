// icons/svgs/duo-stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconGodlyWebsiteDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m13.5 2-6 10h9l-6 10"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.5 12h9"
				fill="none"
			/>
		</svg>
	)
}

export default IconGodlyWebsiteDuoStroke
