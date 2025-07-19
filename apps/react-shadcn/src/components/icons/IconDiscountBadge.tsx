// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconDiscountBadge: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M9.132 21.005a3.925 3.925 0 0 0 5.736 0 1.93 1.93 0 0 1 1.472-.61 3.925 3.925 0 0 0 4.055-4.055 1.93 1.93 0 0 1 .61-1.472 3.925 3.925 0 0 0 0-5.736 1.93 1.93 0 0 1-.61-1.472 3.925 3.925 0 0 0-4.055-4.055 1.93 1.93 0 0 1-1.472-.61 3.925 3.925 0 0 0-5.736 0 1.93 1.93 0 0 1-1.472.61A3.925 3.925 0 0 0 3.605 7.66a1.93 1.93 0 0 1-.61 1.472 3.925 3.925 0 0 0 0 5.736c.406.38.628.916.61 1.472a3.925 3.925 0 0 0 4.055 4.055 1.93 1.93 0 0 1 1.472.61Zm7.01-11.227a1.1 1.1 0 1 0-1.556-1.556l-6.364 6.364a1.1 1.1 0 0 0 1.556 1.556zM7.9 9.25a1.35 1.35 0 1 1 2.7 0 1.35 1.35 0 0 1-2.7 0Zm7.214 4.514a1.35 1.35 0 1 0 0 2.7 1.35 1.35 0 0 0 0-2.7Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconDiscountBadge
