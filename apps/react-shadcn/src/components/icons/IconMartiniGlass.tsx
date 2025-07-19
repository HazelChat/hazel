// icons/svgs/solid/food

import type React from "react"
import type { SVGProps } from "react"

export const IconMartiniGlass: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M3 3a1 1 0 0 0-.707 1.707L11 13.414V20H7a1 1 0 1 0 0 2h10.5a1 1 0 1 0 0-2H13v-6.586l8.707-8.707A1 1 0 0 0 21 3zm14.553 3.033a71 71 0 0 1-11.106 0L5.414 5h13.172z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMartiniGlass
