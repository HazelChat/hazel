// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconCircleDottedStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7.425 4.08v.01M4.08 7.421v.01m-1.23 4.563v.01m1.23 4.562v.01m3.345 3.333v.01M12 21.14v.01m4.575-1.24v.01m3.345-3.353v.01m1.23-4.583v.01m-1.23-4.582v.01M16.575 4.08v.01M12 2.85v.01"
				fill="none"
			/>
		</svg>
	)
}

export default IconCircleDottedStroke
