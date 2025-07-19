// icons/svgs/contrast/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconMapPin021: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M17 8A5 5 0 1 1 7 8a5 5 0 0 1 10 0Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 0v8"
			/>
		</svg>
	)
}

export default IconMapPin021
