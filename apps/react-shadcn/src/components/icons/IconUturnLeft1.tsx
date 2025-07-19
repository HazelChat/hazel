// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconUturnLeft1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M4.145 7.595A20.8 20.8 0 0 1 8.03 3.916l-.171 2.32a24 24 0 0 0 0 3.527l.17 2.32a20.8 20.8 0 0 1-3.885-3.68.64.64 0 0 1 0-.808Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.795 8H15a5 5 0 1 1 0 10h-3M7.795 8q0-.884.065-1.764l.17-2.32a20.8 20.8 0 0 0-3.885 3.679.64.64 0 0 0 0 .809 20.8 20.8 0 0 0 3.886 3.679l-.171-2.32A24 24 0 0 1 7.795 8Z"
			/>
		</svg>
	)
}

export default IconUturnLeft1
