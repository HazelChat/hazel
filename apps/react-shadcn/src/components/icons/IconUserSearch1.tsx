// icons/svgs/contrast/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserSearch1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
				<path
					fill="currentColor"
					d="M4 19a4 4 0 0 1 4-4h3.25v.28A6 6 0 0 0 11 17c0 1.27.394 2.446 1.066 3.416V21H6a2 2 0 0 1-2-2Z"
				/>
				<path fill="currentColor" d="M19.121 19.121a3 3 0 1 0-4.242-4.243 3 3 0 0 0 4.242 4.243Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11.254 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h2.29M21 21l-1.879-1.879m0 0a3 3 0 1 0-4.242-4.243 3 3 0 0 0 4.242 4.243ZM16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
			/>
		</svg>
	)
}

export default IconUserSearch1
