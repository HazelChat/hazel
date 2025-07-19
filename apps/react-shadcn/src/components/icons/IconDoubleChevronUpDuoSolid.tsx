// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconDoubleChevronUpDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.075 17.997a1 1 0 0 1-.884-1.585 21.4 21.4 0 0 1 3.884-4.085 1.47 1.47 0 0 1 1.85 0 21.4 21.4 0 0 1 3.884 4.085 1 1 0 0 1-.884 1.585l-2.205-.165a23 23 0 0 0-3.44 0z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M8.075 11.997a1 1 0 0 1-.884-1.585 21.4 21.4 0 0 1 3.884-4.085 1.47 1.47 0 0 1 1.85 0 21.4 21.4 0 0 1 3.884 4.085 1 1 0 0 1-.884 1.585l-2.205-.165a23 23 0 0 0-3.44 0z"
			/>
		</svg>
	)
}

export default IconDoubleChevronUpDuoSolid
