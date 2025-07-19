// icons/svgs/solid/ai

import type React from "react"
import type { SVGProps } from "react"

export const IconMusicQuaverNoteAi: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15 3.643a.64.64 0 0 1 .926-.573A5.56 5.56 0 0 1 19 8.046c0 1.23-.348 2.41-1.01 3.396a1 1 0 0 0 1.659 1.116A8.06 8.06 0 0 0 21 8.046a7.56 7.56 0 0 0-4.179-6.765C15.065.402 13 1.681 13 3.643v11.889a4 4 0 0 0-6 3.466 4 4 0 1 0 8 0z"
				fill="currentColor"
			/>
			<path
				d="M7 3a1 1 0 0 1 .93.633c.293.743.566 1.191.896 1.523s.781.614 1.54.914a1 1 0 0 1 0 1.86c-.759.3-1.21.582-1.54.914s-.603.78-.896 1.523a1 1 0 0 1-1.86 0c-.293-.743-.566-1.19-.896-1.523s-.781-.614-1.54-.914a1 1 0 0 1 0-1.86c.759-.3 1.21-.582 1.54-.914s.603-.78.896-1.523A1 1 0 0 1 7 3Z"
				fill="currentColor"
			/>
			<path d="M2 11a1 1 0 0 1 1-1h.001a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Z" fill="currentColor" />
		</svg>
	)
}

export default IconMusicQuaverNoteAi
