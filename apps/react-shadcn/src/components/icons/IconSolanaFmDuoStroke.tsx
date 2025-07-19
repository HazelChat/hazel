// icons/svgs/duo-stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconSolanaFmDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15.515 12.5A7 7 0 0 1 9 18.58m-.515-7.08a7 7 0 0 1 6.942-6.094"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18.988 12.5C18.728 17.79 14.355 22 9 22M5.012 11.5C5.272 6.21 9.645 2 15 2M9 15a3 3 0 0 0 3-3 3 3 0 0 1 3-3"
				fill="none"
			/>
		</svg>
	)
}

export default IconSolanaFmDuoStroke
