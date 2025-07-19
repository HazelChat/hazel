// icons/svgs/solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconAmieSo: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 8.21a6.21 6.21 0 0 1 10-4.92A6.21 6.21 0 0 1 20.71 12 6.21 6.21 0 0 1 12 20.71 6.21 6.21 0 0 1 3.29 12 6.2 6.2 0 0 1 2 8.21ZM12 8a2 2 0 0 0-2 2v4a2 2 0 1 0 4 0v-4a2 2 0 0 0-2-2Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconAmieSo
