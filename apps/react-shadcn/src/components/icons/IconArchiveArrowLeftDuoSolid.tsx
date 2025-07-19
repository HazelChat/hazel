// icons/svgs/duo-solid/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconArchiveArrowLeftDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				fillRule="evenodd"
				d="M3 2.5a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2z"
				clipRule="evenodd"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M4 9.5a1 1 0 0 0-1 1v7a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5v-7a1 1 0 0 0-1-1z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11.41 18.57a13 13 0 0 1-2.275-2.19A.6.6 0 0 1 9 16m0 0c0-.139.048-.274.135-.381a13 13 0 0 1 2.275-2.19M9 15.999h6"
			/>
		</svg>
	)
}

export default IconArchiveArrowLeftDuoSolid
