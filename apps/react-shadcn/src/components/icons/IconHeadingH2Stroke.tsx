// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconHeadingH2Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 12h8m-8 6V6m8 12V6m9.568 12H16v-.82c1.448-1.015 2.932-1.973 4.119-3.302.793-.888.88-2.217.026-3.11-.694-.725-1.894-.962-2.82-.602-.624.243-.98.73-1.325 1.268"
				fill="none"
			/>
		</svg>
	)
}

export default IconHeadingH2Stroke
