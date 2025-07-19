// icons/svgs/stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconAudioBars02Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 10v3m4-7v11m4-14v18m4-13v7m4-10v13m4-8v3"
				fill="none"
			/>
		</svg>
	)
}

export default IconAudioBars02Stroke
