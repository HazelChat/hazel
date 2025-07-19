// icons/svgs/duo-stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconMicrosoftWindowsDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m18.78 4.012-14 1.556A2 2 0 0 0 3 7.556v8.42a2 2 0 0 0 1.78 1.987l14 1.556A2 2 0 0 0 21 17.53V6.001a2 2 0 0 0-2.22-1.989Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M2 12.766v-2h8V3.982l1.993-.222q.007.057.007.117v6.889h10v2H12v6.889q0 .059-.007.116L10 19.55v-6.784z"
			/>
		</svg>
	)
}

export default IconMicrosoftWindowsDuoStroke
