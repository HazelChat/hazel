// icons/svgs/solid/maths

import type React from "react"
import type { SVGProps } from "react"

export const IconDivideCircle: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85ZM10.95 8c0-.58.47-1.05 1.05-1.05h.001a1.05 1.05 0 1 1 0 2.1H12c-.58 0-1.05-.47-1.05-1.05Zm0 8c0-.58.47-1.05 1.05-1.05h.001a1.05 1.05 0 1 1 0 2.1H12c-.58 0-1.05-.47-1.05-1.05ZM7.9 11a1 1 0 1 0 0 2h8.2a1 1 0 1 0 0-2z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconDivideCircle
