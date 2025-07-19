// icons/svgs/solid/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconMapPin02: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 2a6 6 0 0 0-1 11.917V21a1 1 0 1 0 2 0v-7.083A6.002 6.002 0 0 0 12 2Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMapPin02
