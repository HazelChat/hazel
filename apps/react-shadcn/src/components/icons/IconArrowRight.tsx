// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowRight: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m14.17 6.05.25 4.95H3a1 1 0 1 0 0 2h11.419l-.248 4.95a1 1 0 0 0 1.593.854 31.2 31.2 0 0 0 5.807-5.584 1.95 1.95 0 0 0 0-2.44 31.2 31.2 0 0 0-5.807-5.584 1 1 0 0 0-1.593.854Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowRight
