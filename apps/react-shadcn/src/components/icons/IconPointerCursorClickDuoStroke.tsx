// icons/svgs/duo-stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPointerCursorClickDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10.998 4.879V2.304m4.888 3.843 1.517-1.407M4.875 11.002H2.3m4.368-4.33L4.503 4.507m.233 12.9 1.407-1.518"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9.935 14.14c-.462-1.848-.693-2.772-.44-3.415a2.17 2.17 0 0 1 1.226-1.227c.644-.252 1.567-.02 3.415.44l3.536.885c1.576.394 2.364.59 2.683.809a2.165 2.165 0 0 1 .13 3.481c-.302.241-1.074.497-2.616 1.006a5 5 0 0 0-.54.198 2.17 2.17 0 0 0-1.016 1.015 5 5 0 0 0-.197.54c-.51 1.543-.765 2.314-1.007 2.617a2.165 2.165 0 0 1-3.48-.13c-.219-.32-.416-1.107-.81-2.683z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPointerCursorClickDuoStroke
