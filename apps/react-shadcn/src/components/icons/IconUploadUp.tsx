// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconUploadUp: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 3c-.38 0-.76.127-1.073.38A16 16 0 0 0 8.2 6.212a1 1 0 0 0 .9 1.595q.46-.048.884-.099c.35-.04.686-.08 1.016-.11V15a1 1 0 1 0 2 0V7.599q.493.045 1.015.11.424.05.885.098a1 1 0 0 0 .9-1.595 16 16 0 0 0-2.727-2.832A1.7 1.7 0 0 0 12 3Z"
				fill="currentColor"
			/>
			<path
				d="M4 15a1 1 0 1 0-2 0 6 6 0 0 0 6 6h8a6 6 0 0 0 6-6 1 1 0 1 0-2 0 4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconUploadUp
