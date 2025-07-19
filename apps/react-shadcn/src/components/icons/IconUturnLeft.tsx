// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconUturnLeft: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15 9a4 4 0 0 1 0 8h-3a1 1 0 1 0 0 2h3a6 6 0 0 0 0-12H8.817q.015-.346.04-.69l.171-2.32a1 1 0 0 0-1.586-.882A21.8 21.8 0 0 0 3.37 6.964a1.64 1.64 0 0 0 0 2.071 21.8 21.8 0 0 0 4.073 3.856 1 1 0 0 0 1.586-.882l-.17-2.32Q8.83 9.345 8.816 9z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconUturnLeft
