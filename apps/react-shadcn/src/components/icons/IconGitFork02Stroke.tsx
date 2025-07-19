// icons/svgs/stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconGitFork02Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6 15.5v-7m0 7a3 3 0 1 0 .245.01M6 15.5q.124 0 .245.01M6 8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm11.875-.003c-.154.605-.258.962-.409 1.269a4 4 0 0 1-2.746 2.144c-.417.09-.892.09-1.843.09h-.922c-1.435 0-2.153 0-2.787.219a4 4 0 0 0-1.495.923c-.475.466-.795 1.102-1.428 2.368m11.63-7.013q.062.003.125.003a3 3 0 1 0-.125-.003Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGitFork02Stroke
