// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowLeftDown1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5.591 17.568a30.2 30.2 0 0 1 .152-7.797l4.03 4.455 4.456 4.03a30.2 30.2 0 0 1-7.797.153.95.95 0 0 1-.84-.84Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m9.774 14.226-4.03-4.455a30.2 30.2 0 0 0-.153 7.797.95.95 0 0 0 .84.84c2.59.287 5.21.236 7.798-.151zm0 0L18.59 5.41"
			/>
		</svg>
	)
}

export default IconArrowLeftDown1
