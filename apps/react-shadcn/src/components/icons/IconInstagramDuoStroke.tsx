// icons/svgs/duo-stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconInstagramDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3.4 7.22c-.354 1.01-.354 2.266-.354 4.78s0 3.77.354 4.78a6.3 6.3 0 0 0 3.866 3.866c1.01.354 2.267.354 4.78.354s3.77 0 4.781-.354a6.3 6.3 0 0 0 3.866-3.865c.353-1.01.353-2.267.353-4.781s0-3.77-.353-4.78a6.3 6.3 0 0 0-3.866-3.866C15.817 3 14.56 3 12.047 3s-3.771 0-4.781.354A6.3 6.3 0 0 0 3.4 7.219Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17.046 7h.01m-1.232 4.44a3.819 3.819 0 1 1-7.555 1.12 3.819 3.819 0 0 1 7.555-1.12Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconInstagramDuoStroke
