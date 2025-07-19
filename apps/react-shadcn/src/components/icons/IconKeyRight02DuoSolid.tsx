// icons/svgs/duo-solid/security

import type React from "react"
import type { SVGProps } from "react"

export const IconKeyRight02DuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.533 10a1 1 0 0 0-.105-.445 5.5 5.5 0 1 0 0 4.89 1 1 0 0 0 .104-.445H15l1.146-1.146a.5.5 0 0 1 .708 0L18 14h3l2-2-2-2z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2.2"
				d="M6.5 13v-2a1.25 1.25 0 0 0 0 2Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 10h9l2 2-2 2h-3l-1.146-1.146a.5.5 0 0 0-.708 0L15 14h-3"
			/>
		</svg>
	)
}

export default IconKeyRight02DuoSolid
