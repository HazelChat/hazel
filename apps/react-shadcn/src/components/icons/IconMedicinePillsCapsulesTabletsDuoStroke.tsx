// icons/svgs/duo-stroke/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconMedicinePillsCapsulesTabletsDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				<path
					d="M14.001 18.014A3.999 3.999 0 1 0 22 17.986a3.999 3.999 0 0 0-7.998.028Z"
					fill="none"
				/>
				<path
					d="M9.217 15.762a4.228 4.228 0 1 1-5.979-5.98l6.545-6.544a4.228 4.228 0 0 1 5.979 5.98z"
					fill="none"
				/>
			</g>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m14.001 18.014 7.998-.028m-9.51-5.497L6.51 6.51m4.124.148 1.423-1.423c.371-.372.925-.45 1.374-.236"
				fill="none"
			/>
		</svg>
	)
}

export default IconMedicinePillsCapsulesTabletsDuoStroke
