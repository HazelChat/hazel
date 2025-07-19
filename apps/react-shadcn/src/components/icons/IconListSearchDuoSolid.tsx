// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListSearchDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M4 5a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2z" />
				<path fill="currentColor" d="M4 11a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z" />
				<path fill="currentColor" d="M4 17a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z" />
			</g>
			<path
				fill="currentColor"
				d="M17.5 11c-2.21 0-4 1.79-4 4a3.998 3.998 0 0 0 6.032 3.446l.76.761a1 1 0 0 0 1.415-1.414l-.76-.761A3.998 3.998 0 0 0 17.5 11Z"
			/>
		</svg>
	)
}

export default IconListSearchDuoSolid
