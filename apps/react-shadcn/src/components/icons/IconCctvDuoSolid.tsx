// icons/svgs/duo-solid/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconCctvDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7.031 2.552a3 3 0 0 0-3.674 2.121l-.805 3.005a3 3 0 0 0 2.121 3.674l10.904 2.922a2 2 0 0 0 2.45-1.414l1.323-4.937a2 2 0 0 0-1.415-2.45z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="m8.558 12.393 1.937.52-1.355 3.86a2 2 0 0 1-1.559 1.31l-4.58.764V21a1 1 0 1 1-2 0v-6a1 1 0 1 1 2 0v1.82l4.252-.71z"
			/>
			<path
				fill="currentColor"
				d="M22.21 8.971a1 1 0 0 0-1.932-.518l-1.294 4.83a1 1 0 0 0 1.932.518z"
			/>
		</svg>
	)
}

export default IconCctvDuoSolid
