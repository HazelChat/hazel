// icons/svgs/contrast/ar-&-vr

import type React from "react"
import type { SVGProps } from "react"

export const IconSpatialScreen1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21 15.4V5.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C20.24 4 19.96 4 19.4 4H6.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C5 4.76 5 5.04 5 5.6v9.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C5.76 17 6.04 17 6.6 17h12.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C21 16.24 21 15.96 21 15.4Z"
				opacity=".35"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16 21h-5m-9-7V7m19-1.4v9.8c0 .56 0 .84-.109 1.054a1 1 0 0 1-.437.437C20.24 17 19.96 17 19.4 17H6.6c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437C5 16.24 5 15.96 5 15.4V5.6c0-.56 0-.84.109-1.054a1 1 0 0 1 .437-.437C5.76 4 6.04 4 6.6 4h12.8c.56 0 .84 0 1.054.109a1 1 0 0 1 .437.437C21 4.76 21 5.04 21 5.6Z"
			/>
		</svg>
	)
}

export default IconSpatialScreen1
