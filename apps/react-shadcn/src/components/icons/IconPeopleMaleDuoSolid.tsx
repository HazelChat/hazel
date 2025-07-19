// icons/svgs/duo-solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconPeopleMaleDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 1.034a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M11.384 9.047a5 5 0 0 0-4.93 4.172l-.44 2.615A1 1 0 0 0 7 17h1.153l.532 3.19a3.36 3.36 0 0 0 6.63 0l.529-3.17 1.128.027a1 1 0 0 0 1.01-1.164l-.44-2.655a5 5 0 0 0-4.933-4.181z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconPeopleMaleDuoSolid
