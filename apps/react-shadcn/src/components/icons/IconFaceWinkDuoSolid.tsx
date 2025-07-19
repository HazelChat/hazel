// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFaceWinkDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 2.046c-5.606 0-10.15 4.544-10.15 10.15S6.394 22.346 12 22.346s10.15-4.544 10.15-10.15S17.606 2.046 12 2.046Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M13.45 10.69a1 1 0 0 1 .293-.708l.707-.707a1 1 0 0 1 1.414 1.415 1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1-.293-.708Z"
			/>
			<path fill="currentColor" d="M9 9.197a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z" />
			<path
				fill="currentColor"
				d="M9.143 14.097a1 1 0 1 0-1.428 1.4 6 6 0 0 0 4.285 1.8c1.678 0 3.197-.69 4.285-1.8a1 1 0 1 0-1.428-1.4 4 4 0 0 1-2.857 1.2c-1.12 0-2.13-.459-2.857-1.2Z"
			/>
		</svg>
	)
}

export default IconFaceWinkDuoSolid
