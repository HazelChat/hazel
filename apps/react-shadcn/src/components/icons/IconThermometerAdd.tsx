// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconThermometerAdd: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15 1a4 4 0 0 1 4 4v10a5 5 0 1 1-8 0V5a4 4 0 0 1 4-4Zm0 8a1 1 0 0 0-1 1v6.27A1.998 1.998 0 0 0 15 20a2 2 0 0 0 1-3.73V10a1 1 0 0 0-1-1ZM5 3a1 1 0 0 1 1 1v2h2l.103.005a1 1 0 0 1 0 1.99L8 8H6v2a1 1 0 1 1-2 0V8H2a1 1 0 0 1 0-2h2V4a1 1 0 0 1 1-1Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconThermometerAdd
