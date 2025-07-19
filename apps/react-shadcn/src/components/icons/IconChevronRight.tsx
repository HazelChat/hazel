// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconChevronRight: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.673 12.925a21.4 21.4 0 0 1-4.08 3.88 1 1 0 0 1-1.59-.881 52 52 0 0 0 0-7.848 1 1 0 0 1 1.59-.881 21.4 21.4 0 0 1 4.08 3.88 1.47 1.47 0 0 1 0 1.85Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconChevronRight
