// icons/svgs/solid/ai

import type React from "react"
import type { SVGProps } from "react"

export const IconUserAi: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M7 7a5 5 0 1 1 10 0A5 5 0 0 1 7 7Z" fill="currentColor" />
			<path
				d="M8 14h6.372a6 6 0 0 1-.473.21 3 3 0 0 0-1.514 4.261A3 3 0 0 0 11.171 22H6a3 3 0 0 1-3-3 5 5 0 0 1 5-5Z"
				fill="currentColor"
			/>
			<path
				d="M18 13a1 1 0 0 1 .93.633c.293.743.566 1.19.896 1.523s.781.614 1.54.914a1 1 0 0 1 0 1.86c-.759.3-1.21.582-1.54.914s-.603.78-.896 1.523a1 1 0 0 1-1.86 0c-.293-.743-.566-1.19-.896-1.523s-.781-.614-1.54-.914a1 1 0 0 1 0-1.86c.759-.3 1.21-.582 1.54-.914s.603-.78.896-1.523A1 1 0 0 1 18 13Z"
				fill="currentColor"
			/>
			<path d="M13 21a1 1 0 0 1 1-1h.001a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z" fill="currentColor" />
		</svg>
	)
}

export default IconUserAi
