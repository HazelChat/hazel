// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowDown: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m17.95 13.17-4.95.25V4a1 1 0 1 0-2 0v9.419l-4.95-.248a1 1 0 0 0-.854 1.593 31.2 31.2 0 0 0 5.585 5.807 1.95 1.95 0 0 0 2.438 0 31.2 31.2 0 0 0 5.585-5.807 1 1 0 0 0-.854-1.593Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowDown
