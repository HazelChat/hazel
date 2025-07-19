// icons/svgs/duo-solid/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconTextQuotesOpenDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14 13.999A9.4 9.4 0 0 1 18 6.3M4 14a9.4 9.4 0 0 1 4-7.7"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M17 17.999a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-10 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconTextQuotesOpenDuoSolid
