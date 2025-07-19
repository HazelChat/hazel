// icons/svgs/stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconGitBranchStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6 15.5V3m0 12.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm9-10a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm0 0a9 9 0 0 0-9 9"
				fill="none"
			/>
		</svg>
	)
}

export default IconGitBranchStroke
