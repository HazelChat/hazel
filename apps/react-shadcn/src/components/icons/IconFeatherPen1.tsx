// icons/svgs/contrast/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconFeatherPen1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.842 3C9.266 3 4.716 10.688 3.18 16.609c11.219 1.72 12.784-1.89 12.668-4.499 3.973-1.819 5.115-6.05 4.994-9.11Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeWidth="2"
				d="M2.5 21.5c0-1.226.18-2.965.68-4.891m0 0C4.716 10.689 9.266 3 20.842 3c.121 3.06-1.021 7.291-4.994 9.11M3.18 16.61c11.219 1.72 12.784-1.89 12.668-4.499m0 0c-1.22.559-2.706.89-4.506.89"
			/>
		</svg>
	)
}

export default IconFeatherPen1
