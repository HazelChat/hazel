// icons/svgs/stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconWalletconnectStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5.769 8.846A8.23 8.23 0 0 1 12 6a8.23 8.23 0 0 1 6.231 2.846M2 12.111l5 5.625 5-5.625 5 5.625 5-5.625"
				fill="none"
			/>
		</svg>
	)
}

export default IconWalletconnectStroke
