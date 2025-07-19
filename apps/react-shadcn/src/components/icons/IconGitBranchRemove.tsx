// icons/svgs/solid/development

import type React from "react"
import type { SVGProps } from "react"

export const IconGitBranchRemove: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18 1.5a4 4 0 0 0-3.884 3.039A10 10 0 0 0 7 8.499V3a1 1 0 0 0-2 0v11.626A4.002 4.002 0 0 0 6 22.5a4 4 0 0 0 1-7.874V14.5a8 8 0 0 1 7.138-7.954A4.002 4.002 0 0 0 22 5.5a4 4 0 0 0-4-4Z"
				fill="currentColor"
			/>
			<path d="M15 17a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z" fill="currentColor" />
		</svg>
	)
}

export default IconGitBranchRemove
