// icons/svgs/stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconMicMicrophoneStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16.655 11.561a4.28 4.28 0 1 0-4.216-4.218m.002-.022 4.238 4.238-9.908 8.865a2.263 2.263 0 0 1-3.195-3.195z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMicMicrophoneStroke
