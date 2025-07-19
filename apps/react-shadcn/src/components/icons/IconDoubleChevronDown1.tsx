// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconDoubleChevronDown1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M11.702 16.894A20.4 20.4 0 0 1 8 13l2.205.165a24 24 0 0 0 3.59 0L16 13a20.4 20.4 0 0 1-3.702 3.894.47.47 0 0 1-.596 0Z"
				/>
				<path
					fill="currentColor"
					d="M11.702 10.894A20.4 20.4 0 0 1 8 7l2.205.165a24 24 0 0 0 3.59 0L16 7a20.4 20.4 0 0 1-3.702 3.894.47.47 0 0 1-.596 0Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11.702 16.894A20.4 20.4 0 0 1 8 13l2.205.165a24 24 0 0 0 3.59 0L16 13a20.4 20.4 0 0 1-3.702 3.894.47.47 0 0 1-.596 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11.702 10.894A20.4 20.4 0 0 1 8 7l2.205.165a24 24 0 0 0 3.59 0L16 7a20.4 20.4 0 0 1-3.702 3.894.47.47 0 0 1-.596 0Z"
			/>
		</svg>
	)
}

export default IconDoubleChevronDown1
