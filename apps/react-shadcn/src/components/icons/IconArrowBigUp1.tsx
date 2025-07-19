// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowBigUp1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M10.6 20.997h2.8c.56 0 .84 0 1.054-.11a1 1 0 0 0 .437-.436c.109-.213.109-.494.109-1.054V9.474q2.005.099 4 .33a35.3 35.3 0 0 0-6.307-6.557 1.11 1.11 0 0 0-1.386 0A35.3 35.3 0 0 0 5 9.805a60 60 0 0 1 4-.33v9.92c0 .56 0 .84.109 1.055a1 1 0 0 0 .437.437c.214.11.494.11 1.054.11Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13.4 20.997h-2.8c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437C9 20.237 9 19.957 9 19.397V9.474q-2.005.099-4 .33a35.3 35.3 0 0 1 6.307-6.558 1.11 1.11 0 0 1 1.386 0A35.3 35.3 0 0 1 19 9.804a61 61 0 0 0-4-.33v9.923c0 .56 0 .84-.109 1.054a1 1 0 0 1-.437.437c-.214.109-.494.109-1.054.109Z"
			/>
		</svg>
	)
}

export default IconArrowBigUp1
