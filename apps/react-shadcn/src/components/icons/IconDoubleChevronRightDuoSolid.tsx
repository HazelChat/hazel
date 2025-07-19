// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconDoubleChevronRightDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6.003 8.075a1 1 0 0 1 1.585-.884 21.4 21.4 0 0 1 4.085 3.884 1.47 1.47 0 0 1 0 1.85 21.4 21.4 0 0 1-4.085 3.884 1 1 0 0 1-1.585-.884l.165-2.205a23 23 0 0 0 0-3.44z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M12.003 8.075a1 1 0 0 1 1.585-.884 21.4 21.4 0 0 1 4.085 3.884 1.47 1.47 0 0 1 0 1.85 21.4 21.4 0 0 1-4.085 3.884 1 1 0 0 1-1.585-.884l.165-2.205a23 23 0 0 0 0-3.44z"
			/>
		</svg>
	)
}

export default IconDoubleChevronRightDuoSolid
