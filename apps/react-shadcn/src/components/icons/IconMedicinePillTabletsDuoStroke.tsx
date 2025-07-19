// icons/svgs/duo-stroke/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconMedicinePillTabletsDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				opacity=".28"
			>
				<path d="M12.306 15.283a5 5 0 1 0 9.391 3.437 5 5 0 0 0-9.391-3.437Z" fill="none" />
				<path d="M2.114 8.056a5 5 0 1 0 9.775-2.11 5 5 0 0 0-9.775 2.11Z" fill="none" />
			</g>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m12.306 15.283 9.391 3.437M2.114 8.056l9.775-2.11"
				fill="none"
			/>
		</svg>
	)
}

export default IconMedicinePillTabletsDuoStroke
