// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListTextWrapDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 18h2.5M4 6h16"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M3 12a1 1 0 0 1 1-1h13a4 4 0 0 1 0 8h-2.508l.306 1.836a1 1 0 0 1-1.587.964 16 16 0 0 1-2.83-2.727 1.7 1.7 0 0 1 0-2.146 16 16 0 0 1 2.83-2.727 1 1 0 0 1 1.587.964L14.492 17H17a2 2 0 1 0 0-4H4a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconListTextWrapDuoSolid
