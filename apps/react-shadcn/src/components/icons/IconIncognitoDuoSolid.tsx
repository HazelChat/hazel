// icons/svgs/duo-solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconIncognitoDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					fill="currentColor"
					d="M6.146 4.35a4 4 0 0 1 4.026-2.086c1.316.165 2.34.165 3.656 0a4 4 0 0 1 4.025 2.087l2.612 4.896a1 1 0 0 1-1.07 1.453 39.4 39.4 0 0 0-14.79 0 1 1 0 0 1-1.07-1.453z"
				/>
				<path fill="currentColor" d="M10 16a1 1 0 1 0 0 2h4a1 1 0 0 0 0-2z" />
			</g>
			<path
				fill="currentColor"
				d="M4.606 10.7a39.3 39.3 0 0 1 14.789 0q1.192.229 2.356.529a1 1 0 1 0 .498-1.937 41 41 0 0 0-2.477-.556 41.4 41.4 0 0 0-15.543 0q-1.253.24-2.478.556a1 1 0 1 0 .498 1.937q1.166-.3 2.357-.53Z"
			/>
			<path fill="currentColor" d="M1 17a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" />
			<path fill="currentColor" d="M13 17a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" />
		</svg>
	)
}

export default IconIncognitoDuoSolid
