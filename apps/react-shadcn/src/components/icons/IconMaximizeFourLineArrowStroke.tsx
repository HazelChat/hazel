// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMaximizeFourLineArrowStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16 20.76a17.3 17.3 0 0 0 4.456.167.52.52 0 0 0 .322-.15M20.76 16a17.3 17.3 0 0 1 .167 4.456.52.52 0 0 1-.15.322m0 0L15 15M8 3.24a17.3 17.3 0 0 0-4.456-.167.52.52 0 0 0-.322.15M3.24 8a17.3 17.3 0 0 1-.167-4.456.52.52 0 0 1 .15-.322m0 0L9 9M8 20.76a17.3 17.3 0 0 1-4.456.167.52.52 0 0 1-.322-.15M3.24 16a17.3 17.3 0 0 0-.167 4.456.52.52 0 0 0 .15.322m0 0L9 15m7-11.76a17.3 17.3 0 0 1 4.456-.167.52.52 0 0 1 .322.15M20.76 8a17.3 17.3 0 0 0 .167-4.456.52.52 0 0 0-.15-.322m0 0L15 9"
				fill="none"
			/>
		</svg>
	)
}

export default IconMaximizeFourLineArrowStroke
