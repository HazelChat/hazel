// icons/svgs/contrast/security

import type React from "react"
import type { SVGProps } from "react"

export const IconKeyRight021: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="m19.999 10 2 2-2 2h-3l-1.146-1.146a.5.5 0 0 0-.708 0L13.999 14h-3.468a4.5 4.5 0 1 1 0-4z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m20 10 2 2-2 2h-3l-1.146-1.146a.5.5 0 0 0-.708 0L14 14h-3.468a4.5 4.5 0 1 1 0-4z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5.5 13v-2a1.25 1.25 0 0 0 0 2Z"
			/>
		</svg>
	)
}

export default IconKeyRight021
