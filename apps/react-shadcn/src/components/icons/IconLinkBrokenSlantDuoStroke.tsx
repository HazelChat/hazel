// icons/svgs/duo-stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconLinkBrokenSlantDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m5.446 10.957-.707.707a5 5 0 0 0 7.071 7.071l.707-.707m-2.12-12.02.706-.708a5 5 0 0 1 7.071 7.071l-.707.707"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4.911 7.422h-3M7.74 4.593v-3m8.4 17.057v3m2.828-5.829h3"
				fill="none"
			/>
		</svg>
	)
}

export default IconLinkBrokenSlantDuoStroke
