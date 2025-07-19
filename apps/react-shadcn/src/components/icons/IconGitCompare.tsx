// icons/svgs/solid/development

import type React from "react"
import type { SVGProps } from "react"

export const IconGitCompare: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6 2a4 4 0 0 0-1 7.874V13a6 6 0 0 0 6 6 1 1 0 1 0 0-2 4 4 0 0 1-4-4V9.874A4.002 4.002 0 0 0 6 2Z"
				fill="currentColor"
			/>
			<path
				d="M13 5a1 1 0 1 0 0 2 4 4 0 0 1 4 4v3.126A4.002 4.002 0 0 0 18 22a4 4 0 0 0 1-7.874V11a6 6 0 0 0-6-6Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconGitCompare
