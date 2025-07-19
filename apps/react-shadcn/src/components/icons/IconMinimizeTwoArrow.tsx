// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMinimizeTwoArrow: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.56 11.909c1.859.172 3.743.1 5.605-.211a1 1 0 0 0 .488-1.744l-1.73-1.493a23 23 0 0 1-2.384-2.384l-1.493-1.73a1 1 0 0 0-1.744.488 21.8 21.8 0 0 0-.21 5.604 1.62 1.62 0 0 0 1.469 1.47Z"
				fill="currentColor"
			/>
			<path
				d="M4.835 12.302a21.8 21.8 0 0 1 5.604-.21 1.62 1.62 0 0 1 1.47 1.469c.172 1.858.1 3.742-.211 5.604a1 1 0 0 1-1.744.488l-1.493-1.73a23 23 0 0 0-2.384-2.384l-1.73-1.493a1 1 0 0 1 .488-1.744Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMinimizeTwoArrow
