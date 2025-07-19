// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconMicOn: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M12 2a5 5 0 0 0-5 5v5a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z" fill="currentColor" />
			<path
				d="M5 12a1 1 0 1 0-2 0 9 9 0 0 0 8 8.945V22a1 1 0 1 0 2 0v-1.055A9 9 0 0 0 21 12a1 1 0 1 0-2 0 7 7 0 1 1-14 0Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMicOn
