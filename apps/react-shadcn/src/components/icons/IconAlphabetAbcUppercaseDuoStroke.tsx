// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconAlphabetAbcUppercaseDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10 12h2.2M10 12V8h2.2a2 2 0 1 1 0 4M10 12v4h3a2 2 0 1 0 0-4h-.8m10.5 3.236a3 3 0 0 1-5-2.236v-2a3 3 0 0 1 5-2.236"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M2 16.003v-3.784c0-1.879.847-3.568 2.139-4.266a.74.74 0 0 1 .722 0C6.153 8.651 7 10.34 7 12.22v3.784m-5-3h5"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlphabetAbcUppercaseDuoStroke
