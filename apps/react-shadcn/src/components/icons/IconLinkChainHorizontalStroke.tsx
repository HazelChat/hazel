// icons/svgs/stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconLinkChainHorizontalStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.9 13q.1-.486.1-1a5 5 0 0 0-2-4 4.98 4.98 0 0 0-3-1H7a5 5 0 0 0 0 10h1m2.1-6q-.1.486-.1 1c0 1.636.786 3.088 2 4 .836.628 1.874 1 3 1h2a5 5 0 0 0 0-10h-1"
				fill="none"
			/>
		</svg>
	)
}

export default IconLinkChainHorizontalStroke
