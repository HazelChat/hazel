// icons/svgs/contrast/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconAc1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M20 8H4a2 2 0 0 0-2 2v6h20v-6a2 2 0 0 0-2-2Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18 12h-2m6 4v-6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6z"
			/>
		</svg>
	)
}

export default IconAc1
