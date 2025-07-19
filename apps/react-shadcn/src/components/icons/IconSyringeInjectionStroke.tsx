// icons/svgs/stroke/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconSyringeInjectionStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9.808 14.192 7.615 12m-1.461 5.846L2.5 21.5M20.039 3.962l-3.654 3.653M12.73 3.962l7.307 7.307m-7.307 0-2.192-2.192M18.577 2.5 21.5 5.423M10.539 9.077l3.653-3.654 4.385 4.385-8.477 8.477c-.614.613-.92.92-1.275 1.035a1.55 1.55 0 0 1-.958 0c-.354-.114-.66-.422-1.275-1.035l-.877-.877c-.614-.614-.92-.921-1.035-1.275a1.55 1.55 0 0 1 0-.958c.115-.354.421-.661 1.035-1.275l1.9-1.9m2.924-2.923L7.615 12"
				fill="none"
			/>
		</svg>
	)
}

export default IconSyringeInjectionStroke
