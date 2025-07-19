// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconSupportHeartStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15.424 14h4.47c1.364 0 3.468 1.687 1.951 2.997C17.5 21 10.5 21 6 16.913M10 16h4.838c.764 0 1.26-.803.919-1.486A2.74 2.74 0 0 0 13.307 13h-1.122a.8.8 0 0 1-.35-.083 10.47 10.47 0 0 0-5.839-1.04m0 0A2 2 0 0 0 2 12v5a2 2 0 1 0 4 0v-.087m-.004-5.037Q6 11.938 6 12v4.913m8.81-7.34c-.364 0-3.634-1.688-3.634-4.049 0-1.18 1.09-2.024 2.18-2.024.536 0 1.09.169 1.454.675.363-.506.908-.682 1.453-.675 1.09.015 2.18.844 2.18 2.024 0 2.361-3.27 4.048-3.634 4.048Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconSupportHeartStroke
