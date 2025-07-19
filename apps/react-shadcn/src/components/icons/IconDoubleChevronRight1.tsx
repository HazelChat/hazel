// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconDoubleChevronRight1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M16.894 11.702A20.4 20.4 0 0 0 13 8l.165 2.205a24 24 0 0 1 0 3.59L13 16a20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596Z"
				/>
				<path
					fill="currentColor"
					d="M10.894 11.702A20.4 20.4 0 0 0 7 8l.165 2.205a24 24 0 0 1 0 3.59L7 16a20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16.894 11.702A20.4 20.4 0 0 0 13 8l.165 2.205a24 24 0 0 1 0 3.59L13 16a20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10.894 11.702A20.4 20.4 0 0 0 7 8l.165 2.205a24 24 0 0 1 0 3.59L7 16a20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596Z"
			/>
		</svg>
	)
}

export default IconDoubleChevronRight1
