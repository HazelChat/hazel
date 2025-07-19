// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowBigRight1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3.003 13.4v-2.8c0-.56 0-.84.109-1.054a1 1 0 0 1 .437-.437C3.762 9 4.043 9 4.603 9h9.923a61 61 0 0 0-.33-4 35.3 35.3 0 0 1 6.557 6.307 1.11 1.11 0 0 1 0 1.386A35.3 35.3 0 0 1 14.195 19q.232-1.995.33-4H4.604c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437c-.11-.214-.11-.494-.11-1.054Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3.002 10.6v2.8c0 .56 0 .84.11 1.054a1 1 0 0 0 .436.437c.214.109.494.109 1.054.109h9.924a61 61 0 0 1-.33 4 35.3 35.3 0 0 0 6.557-6.307 1.11 1.11 0 0 0 0-1.386A35.3 35.3 0 0 0 14.195 5q.232 1.995.33 4H4.603c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437c-.109.214-.109.494-.109 1.054Z"
			/>
		</svg>
	)
}

export default IconArrowBigRight1
