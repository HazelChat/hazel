// icons/svgs/duo-stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconFeatherPenDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeWidth="2"
				d="M3.18 16.61c11.219 1.719 12.784-1.891 12.668-4.5"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeWidth="2"
				d="M2.5 21.5c0-1.226.18-2.965.68-4.891C4.716 10.689 9.266 3 20.842 3c.121 3.06-1.021 7.291-4.994 9.11-1.22.559-2.706.89-4.506.89"
				fill="none"
			/>
		</svg>
	)
}

export default IconFeatherPenDuoStroke
