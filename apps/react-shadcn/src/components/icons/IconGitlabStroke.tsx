// icons/svgs/stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconGitlabStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m8.118 8.087-1.764-5.16a.62.62 0 0 0-1.18.002l-2.392 7.088c-.709 2.101-.053 4.43 1.642 5.83l6.27 5.18a2.05 2.05 0 0 0 2.615.003l6.257-5.14c1.7-1.398 2.361-3.73 1.653-5.835l-2.395-7.122a.62.62 0 0 0-1.179-.003l-1.763 5.157c-.145.425-.54.71-.982.71H9.1a1.04 1.04 0 0 1-.982-.71Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGitlabStroke
