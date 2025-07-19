// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconUturnLeftDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4 8h11a5 5 0 0 1 0 10h-3"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M9.028 3.99a1 1 0 0 0-1.586-.882A21.8 21.8 0 0 0 3.37 6.964a1.64 1.64 0 0 0 0 2.071 21.8 21.8 0 0 0 4.073 3.856 1 1 0 0 0 1.586-.882l-.17-2.32a23 23 0 0 1 0-3.38z"
			/>
		</svg>
	)
}

export default IconUturnLeftDuoSolid
