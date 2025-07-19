// icons/svgs/contrast/media

import type React from "react"
import type { SVGProps } from "react"

export const IconMusicQuaverNoteOff1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				fillRule="evenodd"
				d="M12 16.654a1 1 0 0 1 1 1v1.344a4 4 0 0 1-5.504 3.71 1 1 0 0 1-.33-1.634l3.908-3.91q.056-.055.118-.1a1 1 0 0 1 .808-.41Z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 18.998a3 3 0 0 1-4.127 2.783M12 18.998a3 3 0 0 0-.218-1.126M12 18.998v-1.344M12 12V3.643a1.64 1.64 0 0 1 2.374-1.468A6.56 6.56 0 0 1 17.75 6.25M12 12l5.75-5.75M12 12l-4.285 4.285M22 2l-4.25 4.25M7.715 16.285a3 3 0 0 0-1.426 1.426m1.426-1.426-1.426 1.426m0 0L2 22"
			/>
		</svg>
	)
}

export default IconMusicQuaverNoteOff1
