// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowRight1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.79 11.406A30.2 30.2 0 0 0 15.17 6l.3 6-.3 6a30.2 30.2 0 0 0 5.62-5.406.95.95 0 0 0 0-1.188Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m15.47 12-.3-6a30.2 30.2 0 0 1 5.62 5.406.95.95 0 0 1 0 1.188A30.2 30.2 0 0 1 15.17 18zm0 0H3"
			/>
		</svg>
	)
}

export default IconArrowRight1
