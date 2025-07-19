// icons/svgs/solid/automotive

import type React from "react"
import type { SVGProps } from "react"

export const IconCyberTruck: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M10.233 6.028a1 1 0 0 0-.719.098l-9 5A1 1 0 0 0 0 12v3a1 1 0 0 0 1 1h2.17a3.001 3.001 0 0 0 5.66 0h6.34a3.001 3.001 0 0 0 5.66 0H22a1 1 0 0 0 .995-.9l.5-5a1 1 0 0 0-.762-1.072zM5 15a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm12 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCyberTruck
