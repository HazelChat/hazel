// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconChevronBigLeft: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.414 5.19a1 1 0 0 1 1.582.893 71 71 0 0 0 0 11.834 1 1 0 0 1-1.582.893 31.6 31.6 0 0 1-6.007-5.669 1.8 1.8 0 0 1 0-2.282 31.6 31.6 0 0 1 6.007-5.67Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconChevronBigLeft
