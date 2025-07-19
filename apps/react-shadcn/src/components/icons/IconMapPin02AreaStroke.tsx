// icons/svgs/stroke/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconMapPin02AreaStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 0v6m-5-1.836c-2.989.562-5 1.613-5 2.816 0 1.794 4.477 3.25 10 3.25s10-1.456 10-3.25c0-1.203-2.011-2.254-5-2.816"
				fill="none"
			/>
		</svg>
	)
}

export default IconMapPin02AreaStroke
