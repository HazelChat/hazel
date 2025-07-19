// icons/svgs/stroke/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserSettingsStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11.176 15H8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h5.176M18 18h.01M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm2 7 1.179 1.155 1.65.017.017 1.65L22 18l-1.154 1.179-.018 1.65-1.65.017L18 22l-1.179-1.154-1.65-.018-.016-1.65L14 18l1.155-1.179.017-1.65 1.65-.016z"
				fill="none"
			/>
		</svg>
	)
}

export default IconUserSettingsStroke
