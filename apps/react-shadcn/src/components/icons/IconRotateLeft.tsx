// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconRotateLeft: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7.126 2.26a1 1 0 0 0-1.831.017 16 16 0 0 0-1.119 3.975 1.42 1.42 0 0 0 .408 1.235c.25.247.548.37.703.429l.123.046a16 16 0 0 0 3.685.897 1 1 0 0 0 .931-1.577l-.346-.48q-.388-.54-.744-1.099a7 7 0 1 1-3.718 8.048 1 1 0 1 0-1.936.498A9 9 0 0 0 11.998 21 9 9 0 1 0 7.935 3.967q-.3-.576-.566-1.168z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconRotateLeft
