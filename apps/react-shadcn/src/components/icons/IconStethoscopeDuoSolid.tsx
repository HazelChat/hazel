// icons/svgs/duo-solid/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconStethoscopeDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10.5 3.012a2.5 2.5 0 0 1 2.5 2.5v1.684c0 1.82-.638 3.581-1.803 4.979l-.245.295A3.82 3.82 0 0 1 8 13.852M5.5 3.012a2.5 2.5 0 0 0-2.5 2.5v1.684c0 1.82.638 3.581 1.803 4.979l.245.295A3.82 3.82 0 0 0 8 13.852m0 0v1.66a5.5 5.5 0 1 0 11 0v-1.5"
				opacity=".28"
			/>
			<path fill="currentColor" d="M19 8.012a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
			<path
				fill="currentColor"
				d="M4.3 4.612c.275-.366.71-.6 1.2-.6a1 1 0 0 0 0-2A3.5 3.5 0 0 0 2.7 3.41a1 1 0 0 0 1.6 1.201Z"
			/>
			<path
				fill="currentColor"
				d="M10.5 2.012a1 1 0 1 0 0 2c.49 0 .925.234 1.2.6a1 1 0 1 0 1.6-1.201 3.5 3.5 0 0 0-2.8-1.4Z"
			/>
		</svg>
	)
}

export default IconStethoscopeDuoSolid
