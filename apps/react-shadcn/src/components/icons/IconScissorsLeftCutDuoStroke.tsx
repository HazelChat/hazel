// icons/svgs/duo-stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconScissorsLeftCutDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.68 11.875 5.292 4.487m7.388 7.388 3.039 3.039m-3.039-3.039 3.039-3.039m-3.039 3.04-7.388 7.388"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6.875 11.875h1m-5 0h1"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15.719 14.914a3.167 3.167 0 1 1 4.478 4.478 3.167 3.167 0 0 1-4.478-4.478Zm0-6.078a3.167 3.167 0 1 1 4.478-4.478 3.167 3.167 0 0 1-4.478 4.478Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconScissorsLeftCutDuoStroke
