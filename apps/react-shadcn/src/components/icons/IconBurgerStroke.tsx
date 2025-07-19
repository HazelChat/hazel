// icons/svgs/stroke/food

import type React from "react"
import type { SVGProps } from "react"

export const IconBurgerStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.333 13.5c-.947.667-2.385.667-3.333 0-.947-.667-2.386-.667-3.333 0s-2.386.667-3.334 0c-.947-.667-2.385-.667-3.333 0-.947.667-2.386.667-3.333 0M4.36 10h15.278C20.391 10 21 9.443 21 8.757c0-6.342-18-6.342-18 0C3 9.443 3.61 10 4.36 10Zm-.76 7h16.8a.6.6 0 0 1 .6.6 2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 17.6a.6.6 0 0 1 .6-.6Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconBurgerStroke
