// icons/svgs/contrast/alerts

import type React from "react"
import type { SVGProps } from "react"

export const IconInformationTriangle1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.39 3.284a3.55 3.55 0 0 0-2.78 0C7.96 4.412 1.695 14.422 1.88 17.097a3.63 3.63 0 0 0 1.424 2.645c2.212 1.677 15.182 1.677 17.394 0a3.63 3.63 0 0 0 1.424-2.645c.184-2.675-6.08-12.685-8.731-13.813Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 12.376v4m0-7.375zm-1.39-5.716a3.55 3.55 0 0 1 2.78 0c2.651 1.128 8.915 11.138 8.731 13.813a3.63 3.63 0 0 1-1.424 2.645c-2.212 1.677-15.182 1.677-17.394 0a3.63 3.63 0 0 1-1.424-2.645c-.184-2.675 6.08-12.685 8.731-13.813Z"
			/>
		</svg>
	)
}

export default IconInformationTriangle1
