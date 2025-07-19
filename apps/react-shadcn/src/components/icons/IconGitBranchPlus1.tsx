// icons/svgs/contrast/development

import type React from "react"
import type { SVGProps } from "react"

export const IconGitBranchPlus1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M21 5.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
				<path fill="currentColor" d="M9 18.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 15.5V3m0 12.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm9-10a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm0 0a9 9 0 0 0-9 9M18 21v-3m0 0v-3m0 3h-3m3 0h3"
			/>
		</svg>
	)
}

export default IconGitBranchPlus1
