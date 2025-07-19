// icons/svgs/duo-solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserSearchDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8 14a5 5 0 0 0-5 5 3 3 0 0 0 3 3h7.682A6 6 0 0 1 11 17c0-1.093.292-2.117.803-3z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M17 13a4 4 0 1 0 2.032 7.446l1.26 1.261a1 1 0 0 0 1.415-1.414l-1.261-1.261A4 4 0 0 0 17 13Zm-2 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconUserSearchDuoSolid
