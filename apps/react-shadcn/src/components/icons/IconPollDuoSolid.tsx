// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconPollDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				<path fill="currentColor" d="M2 17a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />
				<path fill="currentColor" d="M12 17a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1Z" />
			</g>
			<path fill="currentColor" d="M6 5.9a1.1 1.1 0 0 0 0 2.2h.01a1.1 1.1 0 0 0 0-2.2z" />
			<path
				fill="currentColor"
				d="M2 7a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm4-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
			/>
			<path fill="currentColor" d="M12 7a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1Z" />
		</svg>
	)
}

export default IconPollDuoSolid
