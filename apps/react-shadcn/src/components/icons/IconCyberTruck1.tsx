// icons/svgs/contrast/automotive

import type React from "react"
import type { SVGProps } from "react"

export const IconCyberTruck1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m22.5 10-.5 5h-2a2 2 0 1 0-4 0H8a2 2 0 1 0-4 0H1v-3l9-5z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8 15a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m4 0h8M4 15H1v-3l9-5 12.5 3-.5 5h-2m0 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0"
			/>
		</svg>
	)
}

export default IconCyberTruck1
