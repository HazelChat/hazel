// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMaximizeTwoArrow: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.835 5.302a21.8 21.8 0 0 1 5.604-.21 1.624 1.624 0 0 1 1.47 1.469c.172 1.858.1 3.742-.211 5.604a1 1 0 0 1-1.776.45l-.047-.06a31 31 0 0 0-5.43-5.43l-.06-.047a1 1 0 0 1 .45-1.776Z"
				fill="currentColor"
			/>
			<path
				d="M6.56 18.909c1.859.172 3.743.1 5.605-.211a1 1 0 0 0 .45-1.776l-.06-.047a31 31 0 0 1-5.43-5.43l-.047-.06a1 1 0 0 0-1.776.45 21.8 21.8 0 0 0-.21 5.604 1.624 1.624 0 0 0 1.469 1.47Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMaximizeTwoArrow
