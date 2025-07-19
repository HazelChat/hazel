// icons/svgs/contrast/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconTableLampOff1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M6.727 4.33A2 2 0 0 1 8.612 3h6.777a2 2 0 0 1 1.884 1.33L20 12H4z"
				/>
				<path fill="currentColor" d="M8 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1H8z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 18v-6m-3 9h6m5-9-2.727-7.67A2 2 0 0 0 15.389 3H8.612a2 2 0 0 0-1.885 1.33L4 12zm-4 9v-1a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1z"
			/>
		</svg>
	)
}

export default IconTableLampOff1
