// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconLabFlaskConical: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8 3a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2v4.523a.5.5 0 0 0 .092.289l3.8 5.364 1.63 2.3c1.642 2.32-.016 5.524-2.856 5.524H6.335c-2.841 0-4.498-3.205-2.857-5.523l2.47-3.486 2.96-4.18A.5.5 0 0 0 9 8.524V4a1 1 0 0 1-1-1Zm3 1v4.523a2.5 2.5 0 0 1-.46 1.445l-1.364 1.925a6.3 6.3 0 0 1 1.28.044c1.185.163 2.165.642 2.985 1.08q.167.087.323.173h.002c1.043.56 1.807.971 2.655.958l-2.961-4.18A2.5 2.5 0 0 1 13 8.523V4zM9 15a1 1 0 0 0 0 2h.01a1 1 0 0 0 0-2z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconLabFlaskConical
