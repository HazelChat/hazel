// icons/svgs/solid/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconNavigationHorizontal: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10.694 2.71c.613-.947 2-.947 2.613 0a52.2 52.2 0 0 1 7.074 16.785l.127.559c.314 1.38-1.195 2.452-2.395 1.702L13.03 18.58a1.94 1.94 0 0 0-2.06 0l-5.082 3.177c-1.2.75-2.71-.322-2.396-1.702l.127-.559a52.2 52.2 0 0 1 7.075-16.784Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconNavigationHorizontal
