// icons/svgs/contrast/time

import type React from "react"
import type { SVGProps } from "react"

export const IconClock1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 21.15a9.15 9.15 0 1 0 0-18.3 9.15 9.15 0 0 0 0 18.3Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 8v4.817a.5.5 0 0 0 .231.421L15 15m6.15-3a9.15 9.15 0 1 1-18.3 0 9.15 9.15 0 0 1 18.3 0Z"
			/>
		</svg>
	)
}

export default IconClock1
