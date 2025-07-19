// icons/svgs/duo-stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconCommandCmdDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M9.333 14.667H6.667a2.667 2.667 0 1 0 2.666 2.666z"
					fill="none"
				/>
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M17.333 14.667h-2.666v2.666a2.667 2.667 0 1 0 2.666-2.666Z"
					fill="none"
				/>
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M14.667 6.667v2.666h2.666a2.667 2.667 0 1 0-2.666-2.666Z"
					fill="none"
				/>
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M6.667 9.333h2.666V6.667a2.667 2.667 0 1 0-2.666 2.666Z"
					fill="none"
				/>
			</g>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14.667 14.667H9.334V9.333h5.333z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCommandCmdDuoStroke
