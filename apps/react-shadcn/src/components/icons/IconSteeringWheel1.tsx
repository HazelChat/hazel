// icons/svgs/contrast/automotive

import type React from "react"
import type { SVGProps } from "react"

export const IconSteeringWheel1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19.5 12a7.5 7.5 0 0 0-7.319 9.148 9 9 0 0 1-.363 0q.18-.797.182-1.648a7.5 7.5 0 0 0-9.149-7.318 9 9 0 0 1 0-.31A15.93 15.93 0 0 1 12 9a15.93 15.93 0 0 1 9.149 2.872 9 9 0 0 1-.001.31A7.5 7.5 0 0 0 19.5 12Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 19.5a7.5 7.5 0 0 1 9.148-7.318M12 19.5a7.5 7.5 0 0 0-9.149-7.318M12 19.5c0 .566.062 1.118.181 1.648M12 19.5c0 .566-.063 1.118-.182 1.648m.363 0a9 9 0 0 1-.363 0m.363 0a9.15 9.15 0 0 0 8.967-8.966m-9.33 8.966a9.15 9.15 0 0 1-8.967-8.966m0 0a9 9 0 0 1 0-.31m0 0A15.93 15.93 0 0 1 12 9a15.93 15.93 0 0 1 9.149 2.872m-18.299 0a9.15 9.15 0 0 1 18.299 0m0 0a9 9 0 0 1-.001.31M12 12.01V12"
			/>
		</svg>
	)
}

export default IconSteeringWheel1
