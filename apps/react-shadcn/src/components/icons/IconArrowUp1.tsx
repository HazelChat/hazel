// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowUp1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.406 4.21A30.2 30.2 0 0 0 6 9.83l6-.3 6 .3a30.2 30.2 0 0 0-5.406-5.62.95.95 0 0 0-1.188 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m12 9.53-6 .3a30.2 30.2 0 0 1 5.406-5.62.95.95 0 0 1 1.188 0A30.2 30.2 0 0 1 18 9.83zm0 0V20"
			/>
		</svg>
	)
}

export default IconArrowUp1
