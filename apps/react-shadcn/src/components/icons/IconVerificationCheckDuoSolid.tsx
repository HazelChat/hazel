// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconVerificationCheckDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 1.75c-1.443 0-2.68.741-3.478 1.837-1.346-.21-2.752.144-3.772 1.163-1.02 1.021-1.366 2.43-1.154 3.767-1.094.8-1.846 2.036-1.846 3.483s.752 2.682 1.846 3.483c-.212 1.338.133 2.746 1.154 3.767 1.022 1.021 2.428 1.366 3.765 1.16.802 1.096 2.04 1.84 3.485 1.84 1.441 0 2.687-.74 3.488-1.84 1.335.205 2.741-.14 3.762-1.16 1.018-1.019 1.373-2.425 1.163-3.767 1.094-.802 1.837-2.039 1.837-3.483s-.743-2.68-1.837-3.483c.21-1.342-.145-2.748-1.163-3.767s-2.423-1.373-3.764-1.163C14.684 2.49 13.44 1.75 12 1.75Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m9 12.14 2.007 2.005a12.84 12.84 0 0 1 3.906-4.23l.087-.06"
			/>
		</svg>
	)
}

export default IconVerificationCheckDuoSolid
