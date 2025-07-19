// icons/svgs/duo-stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconLinkHorizontalBrokenDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8 7H7a5 5 0 0 0 0 10h1m7-10h1a5 5 0 0 1 0 10h-1"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10.121 4.121 8 2m6.121 2.121L16.243 2M10.12 20 8 22.121M14.121 20l2.122 2.121"
				fill="none"
			/>
		</svg>
	)
}

export default IconLinkHorizontalBrokenDuoStroke
