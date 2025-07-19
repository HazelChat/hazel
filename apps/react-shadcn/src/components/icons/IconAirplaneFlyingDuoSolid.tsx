// icons/svgs/duo-solid/automotive

import type React from "react"
import type { SVGProps } from "react"

export const IconAirplaneFlyingDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6 3a1 1 0 0 0-.936 1.351l2.493 6.65L6.303 11 3.807 9.336A2 2 0 0 0 2.697 9H2a1 1 0 0 0-.949 1.316l1.317 3.949A4 4 0 0 0 6.162 17H20a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-2.546L9.649 4.366A4 4 0 0 0 6.639 3z"
				clipRule="evenodd"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3 20h18"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconAirplaneFlyingDuoSolid
