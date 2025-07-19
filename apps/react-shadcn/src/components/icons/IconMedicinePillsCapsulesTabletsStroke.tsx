// icons/svgs/stroke/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconMedicinePillsCapsulesTabletsStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.001 18.014 22 17.986m-7.998.028A3.999 3.999 0 0 0 22 17.986m-7.998.028A3.999 3.999 0 1 1 22 17.986M6.51 6.51 3.238 9.783a4.228 4.228 0 0 0 5.98 5.979l3.272-3.272M6.51 6.51l3.273-3.272a4.228 4.228 0 0 1 5.979 5.98L12.49 12.49M6.51 6.51l5.98 5.98m-1.856-5.832 1.423-1.423a1.21 1.21 0 0 1 1.374-.236"
				fill="none"
			/>
		</svg>
	)
}

export default IconMedicinePillsCapsulesTabletsStroke
