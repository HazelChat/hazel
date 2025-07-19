// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconMusicBeamNote: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21 7.967 9 12.682V19a4 4 0 1 1-2-3.465V7.863a3 3 0 0 1 1.903-2.792L19.586.874A2.5 2.5 0 0 1 23 3.201V16a4 4 0 1 1-2-3.465z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMusicBeamNote
