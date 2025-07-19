// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFaceNoMouth: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.605 22.15 12 17.606 1.85 12 1.85ZM9 9a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm7 1a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconFaceNoMouth
