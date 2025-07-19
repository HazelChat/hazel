// icons/svgs/solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconSolscan: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.714 5.796A8.15 8.15 0 0 1 19.029 16.13a1 1 0 1 0 1.724 1.013 10.15 10.15 0 0 0-1.027-11.725C16.09 1.15 9.684.638 5.416 4.274 1.15 7.91.639 14.316 4.275 18.583c2.88 3.38 7.499 4.402 11.414 2.876a1 1 0 1 0-.727-1.863 8.15 8.15 0 0 1-8.247-13.8Z"
				fill="currentColor"
			/>
			<path d="M7 12a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" fill="currentColor" />
		</svg>
	)
}

export default IconSolscan
