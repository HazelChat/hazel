// icons/svgs/stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconTinderStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8.827 9.663c3.627-1.25 4.244-4.507 3.781-7.502 0-.108.093-.185.186-.154 3.473 1.698 7.378 5.402 7.378 10.959 0 4.26-3.304 8.026-8.104 8.026A7.717 7.717 0 0 1 7.715 6.684c.093-.062.217 0 .217.108.046.57.2 2.006.833 2.87z"
				clipRule="evenodd"
				fill="none"
			/>
		</svg>
	)
}

export default IconTinderStroke
