// icons/svgs/contrast/media

import type React from "react"
import type { SVGProps } from "react"

export const IconStopSmall1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9 10.6c0-.56 0-.84.109-1.054a1 1 0 0 1 .437-.437C9.76 9 10.04 9 10.6 9h2.8c.56 0 .84 0 1.054.109a1 1 0 0 1 .437.437C15 9.76 15 10.04 15 10.6v2.8c0 .56 0 .84-.109 1.054a1 1 0 0 1-.437.437C14.24 15 13.96 15 13.4 15h-2.8c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437C9 14.24 9 13.96 9 13.4z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9 10.6c0-.56 0-.84.109-1.054a1 1 0 0 1 .437-.437C9.76 9 10.04 9 10.6 9h2.8c.56 0 .84 0 1.054.109a1 1 0 0 1 .437.437C15 9.76 15 10.04 15 10.6v2.8c0 .56 0 .84-.109 1.054a1 1 0 0 1-.437.437C14.24 15 13.96 15 13.4 15h-2.8c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437C9 14.24 9 13.96 9 13.4z"
			/>
		</svg>
	)
}

export default IconStopSmall1
