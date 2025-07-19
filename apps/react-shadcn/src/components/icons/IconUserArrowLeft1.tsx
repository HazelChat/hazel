// icons/svgs/contrast/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserArrowLeft1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				<path fill="currentColor" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
				<path
					fill="currentColor"
					d="M8 15a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7.395q-.292-.327-.568-.668a3.7 3.7 0 0 1 0-4.664q.276-.341.568-.668z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12.4 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h4.4m5.01 5.573a13 13 0 0 1-2.275-2.191.6.6 0 0 1-.135-.38m2.41-2.572c-.846.634-1.61 1.37-2.275 2.191a.6.6 0 0 0-.135.38m0 0h6M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
			/>
		</svg>
	)
}

export default IconUserArrowLeft1
