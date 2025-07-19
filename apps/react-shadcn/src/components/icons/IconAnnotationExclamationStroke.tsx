// icons/svgs/stroke/communication

import type React from "react"
import type { SVGProps } from "react"

export const IconAnnotationExclamationStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 11.5v-4m-.008 7.5h.01M8.58 3h6.84c2.127 0 3.191 0 4.004.414a3.8 3.8 0 0 1 1.66 1.66c.416.813.416 1.877.416 4.006v4.56c0 .705 0 1.058-.047 1.353a3.8 3.8 0 0 1-3.16 3.16c-.57.09-1.148 0-1.72.054a1.9 1.9 0 0 0-1.232.616c-.333.37-.61.802-.91 1.2-.823 1.1-1.236 1.651-1.742 1.848a1.9 1.9 0 0 1-1.377 0c-.506-.197-.92-.747-1.745-1.848-.298-.398-.575-.83-.91-1.2a1.9 1.9 0 0 0-1.23-.616c-.572-.053-1.15.035-1.72-.055a3.8 3.8 0 0 1-3.16-3.159c-.047-.295-.047-.648-.047-1.354V9.08c0-2.128 0-3.192.414-4.004a3.8 3.8 0 0 1 1.661-1.66C5.388 3 6.452 3 8.58 3Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAnnotationExclamationStroke
