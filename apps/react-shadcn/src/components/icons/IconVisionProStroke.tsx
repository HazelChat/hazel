// icons/svgs/stroke/ar-&-vr

import type React from "react"
import type { SVGProps } from "react"

export const IconVisionProStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 6.5c4.088 0 9.909.142 9.977 5.5.032 2.524-1.113 5.172-3.898 5.475-2.575.28-3.685-2.383-6.08-2.381-2.364.001-3.473 2.616-6 2.39-2.822-.255-4.008-2.932-3.976-5.484.068-5.358 5.89-5.5 9.977-5.5Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconVisionProStroke
