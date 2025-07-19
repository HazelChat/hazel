// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconAlignUpStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16 12.03a20.8 20.8 0 0 0-3.679-3.885.64.64 0 0 0-.404-.145m-4.084 4.03a20.8 20.8 0 0 1 3.68-3.885.64.64 0 0 1 .404-.145m0 0v12M19 4H5"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlignUpStroke
