// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFaceSmileUpsideDown: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M1.85 12.196C1.85 6.59 6.394 2.046 12 2.046s10.15 4.544 10.15 10.15-4.544 10.15-10.15 10.15-10.15-4.544-10.15-10.15Zm14.42-1.585a1 1 0 0 1-1.413-.014A4 4 0 0 0 12 9.397c-1.12 0-2.13.458-2.857 1.2a1 1 0 1 1-1.428-1.4A6 6 0 0 1 12 7.396c1.678 0 3.197.69 4.285 1.8a1 1 0 0 1-.014 1.414ZM8 14.596a1 1 0 1 0 2 0v-1a1 1 0 1 0-2 0zm6 0a1 1 0 1 0 2 0v-1a1 1 0 0 0-2 0z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconFaceSmileUpsideDown
