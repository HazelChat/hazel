// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconThermometerDown: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15 1a4 4 0 0 1 4 4v10a5 5 0 1 1-8 0V5a4 4 0 0 1 4-4Zm0 8a1 1 0 0 0-1 1v6.27A1.998 1.998 0 0 0 15 20a2 2 0 0 0 1-3.73V10a1 1 0 0 0-1-1ZM5.001 5a1 1 0 0 1 1 1v4.343q.285-.308.548-.635l.224-.289a1 1 0 0 1 1.657 1.115l-.058.085a14 14 0 0 1-2.361 2.451l-.113.084a1.6 1.6 0 0 1-.763.269L5 13.429c-.313 0-.626-.092-.896-.275l-.114-.084a14 14 0 0 1-2.1-2.113l-.261-.338-.058-.085A1 1 0 0 1 3.164 9.34l.066.079.223.289q.264.328.548.635V6a1 1 0 0 1 1-1Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconThermometerDown
