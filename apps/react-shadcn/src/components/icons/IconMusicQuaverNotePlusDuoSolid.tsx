// icons/svgs/duo-solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconMusicQuaverNotePlusDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15 18.998V3.643a1.64 1.64 0 0 1 2.374-1.468A6.56 6.56 0 0 1 21 8.046 7.07 7.07 0 0 1 19.819 12"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M7 3a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2H8v2a1 1 0 1 1-2 0V8H4a1 1 0 0 1 0-2h2V4a1 1 0 0 1 1-1Z"
			/>
			<path fill="currentColor" d="M8 18.998A4 4 0 1 1 12 23a4 4 0 0 1-4-4.002Z" />
		</svg>
	)
}

export default IconMusicQuaverNotePlusDuoSolid
