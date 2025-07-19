// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconResolutionQualityHq: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.752 10.094a.752.752 0 1 1 1.503 0v2.28a.752.752 0 0 1-1.503 0z"
				fill="currentColor"
			/>
			<path
				fillRule="evenodd"
				d="M2 8a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5zm13.503-.658a2.75 2.75 0 0 0-2.751 2.752v2.28c0 1.136.688 2.111 1.67 2.531v.754a1 1 0 1 0 2 0v-.69a2.75 2.75 0 0 0 1.833-2.594v-2.281a2.75 2.75 0 0 0-2.752-2.752ZM7.745 8.544a1 1 0 0 0-2 0v6.506a1 1 0 1 0 2 0v-2.003h1.503v2.003a1 1 0 1 0 2 0V8.544a1 1 0 1 0-2 0v2.503H7.746z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconResolutionQualityHq
