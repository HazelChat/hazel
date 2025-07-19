// icons/svgs/solid/security

import type React from "react"
import type { SVGProps } from "react"

export const IconLock02Open: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17.5 2A5.5 5.5 0 0 0 12 7.5v1.527A30 30 0 0 0 10.366 9H6.634c-1.228 0-2.177 0-2.924.226a3 3 0 0 0-.526.21 4 4 0 0 0-1.748 1.748c-.247.485-.346 1.002-.392 1.564C1 13.29 1 13.954 1 14.758v1.483c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C5.29 22 5.954 22 6.758 22h3.483c.805 0 1.47 0 2.01-.044.563-.046 1.08-.145 1.565-.392a4 4 0 0 0 1.748-1.748c.247-.485.346-1.002.392-1.564.044-.541.044-1.206.044-2.01v-1.483c0-.805 0-1.47-.044-2.01-.046-.563-.145-1.08-.392-1.565A4 4 0 0 0 14 9.536V7.5a3.5 3.5 0 1 1 7 0V10a1 1 0 1 0 2 0V7.5A5.5 5.5 0 0 0 17.5 2Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconLock02Open
