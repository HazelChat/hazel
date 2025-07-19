// icons/svgs/duo-stroke/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconArchiveArrowDownDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 8h16v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9.429 15.09c.634.846 1.37 1.61 2.19 2.275.112.09.246.135.381.135m0 0a.6.6 0 0 0 .381-.135 13 13 0 0 0 2.19-2.275M12 17.5v-6"
				fill="none"
			/>
		</svg>
	)
}

export default IconArchiveArrowDownDuoStroke
