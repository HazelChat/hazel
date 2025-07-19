// icons/svgs/solid/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconDeleteForwardRight: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.843 4c.48 0 .868 0 1.265.093.334.078.7.226.994.401.35.21.607.458.92.76l.048.048a34 34 0 0 1 4.553 5.445c.258.383.377.826.377 1.253s-.119.87-.377 1.253a34 34 0 0 1-4.553 5.445l-.049.048c-.312.302-.57.55-.919.76a3.7 3.7 0 0 1-.994.401c-.397.094-.786.093-1.265.093H6.96c-.666 0-1.226 0-1.683-.037-.48-.04-.934-.124-1.366-.344a3.5 3.5 0 0 1-1.53-1.53c-.22-.432-.304-.887-.344-1.365C2 16.266 2 15.706 2 15.04V8.96c0-.666 0-1.225.037-1.683.04-.48.124-.934.344-1.366a3.5 3.5 0 0 1 1.53-1.53c.432-.22.887-.304 1.366-.344C5.734 4 6.294 4 6.96 4zM8.707 8.293a1 1 0 1 0-1.414 1.414L9.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L11 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L12.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L11 10.586z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconDeleteForwardRight
