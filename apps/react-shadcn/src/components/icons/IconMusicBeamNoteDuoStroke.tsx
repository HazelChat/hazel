// icons/svgs/duo-stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconMusicBeamNoteDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8 12V7.863a2 2 0 0 1 1.269-1.861l10.683-4.197A1.5 1.5 0 0 1 22 3.2v3.3M8 12v7m0-7 14-5.5m0 0V16"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M2 19a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16 16a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMusicBeamNoteDuoStroke
