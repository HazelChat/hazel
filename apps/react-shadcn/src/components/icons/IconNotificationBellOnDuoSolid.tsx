// icons/svgs/duo-solid/alerts

import type React from "react"
import type { SVGProps } from "react"

export const IconNotificationBellOnDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 2a8.207 8.207 0 0 0-8.178 7.526l-.355 4.26c-.031.373-.15.735-.32 1.245a2.588 2.588 0 0 0 2.169 3.39 60.6 60.6 0 0 0 13.37 0 2.587 2.587 0 0 0 2.169-3.386c-.17-.512-.29-.873-.32-1.247l-.355-4.262A8.207 8.207 0 0 0 12 2Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M8.193 18.672q.459.029.918.05a61 61 0 0 0 6.698-.05 3.843 3.843 0 0 1-7.616 0ZM12 20a1.84 1.84 0 0 1-1.74-1.234q1.74.051 3.479 0A1.84 1.84 0 0 1 12 20Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconNotificationBellOnDuoSolid
