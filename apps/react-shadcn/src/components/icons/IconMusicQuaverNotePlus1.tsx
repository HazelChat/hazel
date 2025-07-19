// icons/svgs/contrast/media

import type React from "react"
import type { SVGProps } from "react"

export const IconMusicQuaverNotePlus1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M8 18.998a3 3 0 1 1 6.002-.001A3 3 0 0 1 8 18.998Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7 10V7m0 0V4m0 3H4m3 0h3m4 11.998V3.643a1.64 1.64 0 0 1 2.374-1.468A6.56 6.56 0 0 1 20 8.046 7.07 7.07 0 0 1 18.819 12M14 18.998a3 3 0 1 1-3-3.002 3 3 0 0 1 3 3.002Z"
			/>
		</svg>
	)
}

export default IconMusicQuaverNotePlus1
