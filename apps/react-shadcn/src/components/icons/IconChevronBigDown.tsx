// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconChevronBigDown: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18.81 9.586a1 1 0 0 0-.893-1.583 71 71 0 0 1-11.834 0 1 1 0 0 0-.893 1.583 31.6 31.6 0 0 0 5.669 6.007 1.8 1.8 0 0 0 2.282 0 31.6 31.6 0 0 0 5.67-6.007Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconChevronBigDown
