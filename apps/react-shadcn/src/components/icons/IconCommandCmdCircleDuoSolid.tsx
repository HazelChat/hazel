// icons/svgs/duo-solid/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconCommandCmdCircleDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10.333 13.667H8.667a1.667 1.667 0 1 0 1.666 1.666zm0 0h3.334m-3.334 0v-3.334m3.334 3.334h1.666a1.667 1.667 0 1 1-1.666 1.666zm0 0v-3.334m0 0V8.667a1.667 1.667 0 1 1 1.666 1.666zm0 0h-3.334m0 0H8.667a1.667 1.667 0 1 1 1.666-1.666z"
			/>
		</svg>
	)
}

export default IconCommandCmdCircleDuoSolid
