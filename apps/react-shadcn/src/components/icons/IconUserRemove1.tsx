// icons/svgs/contrast/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserRemove1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M4 19a4 4 0 0 1 4-4h4a3 3 0 0 0 3 3h4.874q.125.481.126 1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M20 19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h3m4 0h6m-5-8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
			/>
		</svg>
	)
}

export default IconUserRemove1
