// icons/svgs/contrast/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconTextParagraph1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M9.03 3H13v12.058H9.03A6.03 6.03 0 0 1 9.03 3Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13 3h5m-5 0H9.03a6.03 6.03 0 0 0 0 12.058H13M13 3v12.058M18 3v18m0-18h3m-8 18v-5.942"
			/>
		</svg>
	)
}

export default IconTextParagraph1
