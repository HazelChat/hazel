// icons/svgs/stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconMusicBeamNoteOffStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m22 2.296-.3.295M2 22l.879-.866M8 12.148V8.072c0-.81.503-1.537 1.269-1.834l10.683-4.134a1.51 1.51 0 0 1 1.748.487M8 12.148l6.588-2.55M8 12.148v3.94m14 0c0 1.633-1.343 2.956-3 2.956s-3-1.323-3-2.955 1.343-2.956 3-2.956 3 1.324 3 2.956Zm0 0v-8.22m-7.412 1.731L21.7 2.591m-7.112 7.007L8 16.088m-.879.866A3 3 0 0 0 5 16.09c-1.657 0-3 1.323-3 2.955 0 .817.336 1.555.879 2.09m4.242-4.18L8 16.09m-.879.866-4.242 4.18"
				fill="none"
			/>
		</svg>
	)
}

export default IconMusicBeamNoteOffStroke
