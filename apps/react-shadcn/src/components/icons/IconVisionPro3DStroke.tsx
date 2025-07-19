// icons/svgs/stroke/ar-&-vr

import type React from "react"
import type { SVGProps } from "react"

export const IconVisionPro3DStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2.413 14.5a7.3 7.3 0 0 1-.39-2.5C2.091 6.642 7.913 6.5 12 6.5s9.909.142 9.977 5.5c.01.85-.112 1.716-.387 2.5m-15.568 2a1.2 1.2 0 0 0 1.184 1h1.807c.825 0 1.493-.668 1.493-1.493 0-1.044-1-1.507-2-1.507 1 0 2-.462 2-1.506 0-.825-.669-1.494-1.494-1.494H7.206a1.2 1.2 0 0 0-1.184 1m7.484-.1v4.2a.9.9 0 0 0 .9.9h1.35a2.25 2.25 0 0 0 2.25-2.25v-1.5a2.25 2.25 0 0 0-2.25-2.25h-1.35a.9.9 0 0 0-.9.9Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconVisionPro3DStroke
