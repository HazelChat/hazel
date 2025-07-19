// icons/svgs/duo-stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconLinkChainSlantDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.95 12.636q.271.414.636.778a5 5 0 0 0 4.243 1.415 4.98 4.98 0 0 0 2.828-1.415L19.07 12A5 5 0 0 0 12 4.929l-.707.707"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14.05 11.363a4.99 4.99 0 0 0-4.88-2.192 4.98 4.98 0 0 0-2.827 1.415L4.929 12a5 5 0 1 0 7.07 7.07l.708-.706"
				fill="none"
			/>
		</svg>
	)
}

export default IconLinkChainSlantDuoStroke
