// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconRotateRight: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16.872 2.26a1 1 0 0 1 1.831.017 16 16 0 0 1 1.119 3.975 1.42 1.42 0 0 1-.408 1.235c-.25.247-.548.37-.703.429l-.123.046a16 16 0 0 1-3.685.897 1 1 0 0 1-.931-1.577l.346-.48q.388-.54.744-1.099a7 7 0 1 0 3.718 8.048 1 1 0 0 1 1.936.498C19.717 18.131 16.195 21 12 21a9 9 0 1 1 4.063-17.033q.3-.576.566-1.168z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconRotateRight
