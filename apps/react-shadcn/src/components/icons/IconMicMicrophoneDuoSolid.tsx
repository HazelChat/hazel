// icons/svgs/duo-solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconMicMicrophoneDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16.679 11.559 6.77 20.424a2.263 2.263 0 0 1-3.195-3.195l8.865-9.908"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M16.64 12.56a1 1 0 0 1-.814-.44l-3.955-3.954a1 1 0 0 1-.432-.809 5.28 5.28 0 1 1 5.201 5.204Z"
			/>
		</svg>
	)
}

export default IconMicMicrophoneDuoSolid
