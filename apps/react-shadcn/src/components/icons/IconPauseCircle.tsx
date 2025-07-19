// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPauseCircle: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85S22.15 6.394 22.15 12 17.606 22.15 12 22.15 1.85 17.606 1.85 12Zm8.568-3.1a1 1 0 0 0-2 0v6.2a1 1 0 1 0 2 0zm5.165 0a1 1 0 1 0-2 0v6.2a1 1 0 1 0 2 0z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPauseCircle
