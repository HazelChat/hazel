// icons/svgs/stroke/time

import type React from "react"
import type { SVGProps } from "react"

export const IconClockOffStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 8v4m0 0 6.47-6.47M12 12l-6.47 6.47M22 2l-3.53 3.53m0 0A9.15 9.15 0 0 0 5.53 18.47m0 0L2 22m7.005-1.351A9.15 9.15 0 0 0 20.648 9.005m-5.86 5.86L15 15"
				fill="none"
			/>
		</svg>
	)
}

export default IconClockOffStroke
