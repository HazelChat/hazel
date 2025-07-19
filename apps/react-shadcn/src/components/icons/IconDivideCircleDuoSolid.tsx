// icons/svgs/duo-solid/maths

import type React from "react"
import type { SVGProps } from "react"

export const IconDivideCircleDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M12 6.95a1.05 1.05 0 1 0 0 2.1h.001a1.05 1.05 0 1 0 0-2.1z" />
			<path fill="currentColor" d="M12 14.95a1.05 1.05 0 1 0 0 2.1h.001a1.05 1.05 0 1 0 0-2.1z" />
			<path fill="currentColor" d="M7.9 11a1 1 0 1 0 0 2h8.2a1 1 0 0 0 0-2z" />
		</svg>
	)
}

export default IconDivideCircleDuoSolid
