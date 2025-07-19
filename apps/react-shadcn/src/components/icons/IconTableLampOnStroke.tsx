// icons/svgs/stroke/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconTableLampOnStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 18v-6m-3 9h6m-9-6-1 2m13-2 1 2m1-5-2.727-7.67A2 2 0 0 0 15.389 3H8.612a2 2 0 0 0-1.885 1.33L4 12zm-4 9v-1a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1z"
				fill="none"
			/>
		</svg>
	)
}

export default IconTableLampOnStroke
