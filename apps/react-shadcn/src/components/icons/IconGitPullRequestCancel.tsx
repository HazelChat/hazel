// icons/svgs/solid/development

import type React from "react"
import type { SVGProps } from "react"

export const IconGitPullRequestCancel: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6 2a4 4 0 0 0-1 7.874V21a1 1 0 1 0 2 0V9.874A4.002 4.002 0 0 0 6 2Z"
				fill="currentColor"
			/>
			<path
				d="M16.207 2.793a1 1 0 1 0-1.414 1.414L16.486 5.9l-1.693 1.693a1 1 0 0 0 1.414 1.414L17.9 7.314l1.693 1.693a1 1 0 1 0 1.414-1.414L19.314 5.9l1.693-1.693a1 1 0 0 0-1.414-1.414L17.9 4.486z"
				fill="currentColor"
			/>
			<path
				d="M19 13a1 1 0 1 0-2 0v1.126A4.002 4.002 0 0 0 18 22a4 4 0 0 0 1-7.874z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconGitPullRequestCancel
