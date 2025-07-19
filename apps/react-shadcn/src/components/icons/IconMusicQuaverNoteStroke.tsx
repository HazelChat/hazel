// icons/svgs/stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconMusicQuaverNoteStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 18.998V3.643a1.64 1.64 0 0 1 2.374-1.468A6.56 6.56 0 0 1 18 8.046 7.07 7.07 0 0 1 16.819 12M12 18.998a3 3 0 1 1-3-3.002 3 3 0 0 1 3 3.002Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMusicQuaverNoteStroke
