// icons/svgs/stroke/time

import type React from "react"
import type { SVGProps } from "react"

export const IconTimerPlusStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 17v-3m0 0v-3m0 3H9m3 0h3M12 2v4m0 0a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-2-4h4m5.366 3.322 1.06 1.06"
				fill="none"
			/>
		</svg>
	)
}

export default IconTimerPlusStroke
