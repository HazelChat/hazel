// icons/svgs/stroke/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconTargetCenterStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 21.15A9.15 9.15 0 0 0 21.15 12M12 21.15c-4.958 0-9.15-4.166-9.15-9.15M12 21.15V17m-9.15-5A9.15 9.15 0 0 1 12 2.85M2.85 12H7m14.15 0A9.15 9.15 0 0 0 12 2.85M21.15 12H17m-5-9.15V7m0 10a5 5 0 0 0 5-5m-5 5c-2.71 0-5-2.276-5-5m5 5V7m-5 5a5 5 0 0 1 5-5m-5 5h10m0 0a5 5 0 0 0-5-5"
				fill="none"
			/>
		</svg>
	)
}

export default IconTargetCenterStroke
