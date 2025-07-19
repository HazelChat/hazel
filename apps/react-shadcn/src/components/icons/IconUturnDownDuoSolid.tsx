// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconUturnDownDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8 16.205V9a5 5 0 0 1 10 0v3"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M3.99 14.972a1 1 0 0 0-.882 1.585 21.8 21.8 0 0 0 3.856 4.074 1.64 1.64 0 0 0 2.072 0 21.8 21.8 0 0 0 3.856-4.074 1 1 0 0 0-.882-1.585l-2.32.17a23 23 0 0 1-3.38 0z"
			/>
		</svg>
	)
}

export default IconUturnDownDuoSolid
