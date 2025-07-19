// icons/svgs/solid/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconStethoscope: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 5.512a1.5 1.5 0 0 1 1.5-1.5 1 1 0 0 0 0-2 3.5 3.5 0 0 0-3.5 3.5v1.684a8.78 8.78 0 0 0 2.034 5.619l.246.295A4.8 4.8 0 0 0 7 14.748v.764a6.5 6.5 0 1 0 13 0v-.645a3.502 3.502 0 0 0-1-6.855 3.5 3.5 0 0 0-1 6.855v.645a4.5 4.5 0 1 1-9 0v-.764a4.8 4.8 0 0 0 2.72-1.638l.246-.295A8.78 8.78 0 0 0 14 7.196V5.512a3.5 3.5 0 0 0-3.5-3.5 1 1 0 1 0 0 2 1.5 1.5 0 0 1 1.5 1.5v1.684c0 1.585-.556 3.12-1.57 4.339l-.246.294A2.82 2.82 0 0 1 8 12.853c-.81 0-1.615-.34-2.184-1.023l-.245-.294A6.78 6.78 0 0 1 4 7.196z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconStethoscope
