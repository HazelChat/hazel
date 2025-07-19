// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconMusicQuaverNoteOff: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M14.821 1.28a7.56 7.56 0 0 1 3.286 3.2l3.186-3.187a1 1 0 1 1 1.414 1.414l-20 20a1 1 0 0 1-1.414-1.414l4.176-4.176a4 4 0 0 1 1.652-1.652L11 11.585V3.644c0-1.962 2.065-3.24 3.821-2.362ZM13 3.644a.64.64 0 0 1 .926-.573 5.56 5.56 0 0 1 2.677 2.912L13 9.586z"
				clipRule="evenodd"
				fill="currentColor"
			/>
			<path
				d="M12 16.654a1 1 0 0 0-.808.41q-.061.046-.117.1l-3.91 3.91a1 1 0 0 0 .332 1.633A4 4 0 0 0 13 18.997v-1.343a1 1 0 0 0-1-1Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMusicQuaverNoteOff
