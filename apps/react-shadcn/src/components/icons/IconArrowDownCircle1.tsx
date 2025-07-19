// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowDownCircle1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 2.85a9.15 9.15 0 1 0 0 18.3 9.15 9.15 0 0 0 0-18.3Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16 12.051a20.3 20.3 0 0 1-3.604 3.807A.63.63 0 0 1 12 16m-4-3.95a20.3 20.3 0 0 0 3.604 3.807A.63.63 0 0 0 12 16m0 0V8m-9.15 4a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z"
			/>
		</svg>
	)
}

export default IconArrowDownCircle1
