// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconSupportHeart1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M2 12a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0z" />
				<path
					fill="currentColor"
					d="M14.81 9.572c.363 0 3.633-1.687 3.633-4.048 0-1.18-1.09-2.01-2.18-2.024-.545-.007-1.09.169-1.454.675-.363-.506-.917-.675-1.453-.675-1.09 0-2.18.844-2.18 2.024 0 2.361 3.27 4.048 3.633 4.048Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15.424 14h4.47c1.364 0 3.469 1.687 1.951 2.997C17.5 21 10.5 21 6 16.913M15.424 14q.193.235.333.514A1.027 1.027 0 0 1 14.839 16H10m5.424-2a2.74 2.74 0 0 0-2.116-1h-1.123a.8.8 0 0 1-.35-.083 10.47 10.47 0 0 0-5.839-1.04Q6 11.936 6 12m0 0v4.913M6 12a2 2 0 1 0-4 0v5a2 2 0 1 0 4 0m0-5v5m0-.087V17m8.81-7.428c-.364 0-3.634-1.687-3.634-4.048 0-1.18 1.09-2.024 2.18-2.024.536 0 1.09.169 1.454.675.363-.506.908-.682 1.453-.675 1.09.015 2.18.844 2.18 2.024 0 2.361-3.27 4.048-3.634 4.048Z"
			/>
		</svg>
	)
}

export default IconSupportHeart1
