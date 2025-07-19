// icons/svgs/duo-solid/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconTextQuotesCloseDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10 10a9.4 9.4 0 0 1-4 7.698M20 10a9.4 9.4 0 0 1-4 7.698"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M7 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm10 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconTextQuotesCloseDuoSolid
