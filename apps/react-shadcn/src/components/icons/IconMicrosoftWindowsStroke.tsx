// icons/svgs/stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconMicrosoftWindowsStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11 4.877v13.778m10-6.89H3m1.78 6.198 14 1.556A2 2 0 0 0 21 17.53V6.001a2 2 0 0 0-2.22-1.989l-14 1.556A2 2 0 0 0 3 7.556v8.42a2 2 0 0 0 1.78 1.987Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMicrosoftWindowsStroke
