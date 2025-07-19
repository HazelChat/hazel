// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMinimizeFourLineArrowStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20 15.24a17.3 17.3 0 0 0-4.456-.167.52.52 0 0 0-.322.15M15.241 20a17.3 17.3 0 0 1-.168-4.456.52.52 0 0 1 .15-.322m0 0L21 21M4 8.76a17.3 17.3 0 0 0 4.456.167.52.52 0 0 0 .322-.15M8.76 4a17.3 17.3 0 0 1 .167 4.456.52.52 0 0 1-.15.322m0 0L3 3m1 12.24a17.3 17.3 0 0 1 4.456-.167.52.52 0 0 1 .322.15M8.76 20a17.3 17.3 0 0 0 .167-4.456.52.52 0 0 0-.15-.322m0 0L3 21M20 8.76a17.3 17.3 0 0 1-4.456.167.52.52 0 0 1-.322-.15M15.241 4a17.3 17.3 0 0 0-.168 4.456.52.52 0 0 0 .15.322m0 0L21 3"
				fill="none"
			/>
		</svg>
	)
}

export default IconMinimizeFourLineArrowStroke
