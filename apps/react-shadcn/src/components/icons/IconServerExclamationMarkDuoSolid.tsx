// icons/svgs/duo-solid/development

import type React from "react"
import type { SVGProps } from "react"

export const IconServerExclamationMarkDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M5.4 3A3.4 3.4 0 0 0 2 6.4v1.2A3.4 3.4 0 0 0 5.4 11h13.2A3.4 3.4 0 0 0 22 7.6V6.4A3.4 3.4 0 0 0 18.6 3z"
				/>
				<path
					fill="currentColor"
					d="M5.4 13A3.4 3.4 0 0 0 2 16.4v1.2A3.4 3.4 0 0 0 5.4 21h10.77q.094-.263.231-.5A3 3 0 0 1 16 19v-4c0-.768.289-1.47.764-2z"
				/>
			</g>
			<path fill="currentColor" d="M13 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" />
			<path fill="currentColor" d="M17 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" />
			<path fill="currentColor" d="M13 17a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z" />
			<path fill="currentColor" d="M20 22a1 1 0 1 1-2 0v-.001a1 1 0 0 1 2 0z" />
			<path fill="currentColor" d="M20 19a1 1 0 1 1-2 0v-4a1 1 0 1 1 2 0z" />
		</svg>
	)
}

export default IconServerExclamationMarkDuoSolid
