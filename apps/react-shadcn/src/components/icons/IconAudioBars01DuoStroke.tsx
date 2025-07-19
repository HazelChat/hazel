// icons/svgs/duo-stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconAudioBars01DuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3 10v4m18-4v4M12 3v18"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.5 7v10m9-10v10"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconAudioBars01DuoStroke
