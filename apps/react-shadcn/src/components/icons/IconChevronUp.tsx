// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconChevronUp: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.925 9.327a21.4 21.4 0 0 1 3.88 4.08 1 1 0 0 1-.881 1.59 52 52 0 0 0-7.848 0 1 1 0 0 1-.881-1.59 21.4 21.4 0 0 1 3.88-4.08 1.47 1.47 0 0 1 1.85 0Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconChevronUp
