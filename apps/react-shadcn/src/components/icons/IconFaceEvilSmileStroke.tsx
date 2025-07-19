// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFaceEvilSmileStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m8.386 9.144 1.229.86m4.77 0 1.23-.86m-.044 5.355A5 5 0 0 1 12 16a5 5 0 0 1-3.57-1.5M12 21.15a9.15 9.15 0 1 1 0-18.3 9.15 9.15 0 0 1 0 18.3Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFaceEvilSmileStroke
