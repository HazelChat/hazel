// icons/svgs/duo-solid/security

import type React from "react"
import type { SVGProps } from "react"

export const IconKeySlantDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15.766 7.228 18.595 4.4l2.121 2.121m-4.95.707-5.657 5.657m5.657-5.657 1.414 1.415"
				opacity=".28"
			/>
			<path fill="currentColor" d="M3.745 12.178a5 5 0 1 1 7.07 7.071 5 5 0 0 1-7.07-7.07Z" />
		</svg>
	)
}

export default IconKeySlantDuoSolid
