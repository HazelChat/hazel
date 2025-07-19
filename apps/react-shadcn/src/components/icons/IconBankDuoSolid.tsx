// icons/svgs/duo-solid/money-&-payments

import type React from "react"
import type { SVGProps } from "react"

export const IconBankDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 13v5m5-5v5m6-5v5m5-5v5"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M12.764 1.099a3 3 0 0 0-1.528 0c-.572.15-1.07.524-1.635.95l-.121.091L1.4 8.2A1 1 0 0 0 1 9v1a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V9a1 1 0 0 0-.4-.8l-8.08-6.06-.12-.09c-.567-.427-1.064-.8-1.636-.951Z"
			/>
			<path fill="currentColor" d="M2 20a1 1 0 1 0 0 2h20a1 1 0 1 0 0-2z" />
		</svg>
	)
}

export default IconBankDuoSolid
