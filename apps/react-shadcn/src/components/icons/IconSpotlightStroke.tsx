// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconSpotlightStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g clip-path="url(#a)">
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M9 20.5c0 .828 3.134 2 7 2s7-1.172 7-2c0-.258-.304-.549-.838-.828M9 20.5c0-.829 3.134-2 7-2 2.663 0 4.979.556 6.162 1.172M9 20.5 4.718 10m4.61-3 12.834 12.673M6.614 4.319 5.467 2.681A2 2 0 0 0 2.19 4.975l1.147 1.639z"
					fill="none"
				/>
			</g>
			<defs>
				<clipPath id="a">
					<path fill="currentColor" d="M0 0h24v24H0z" stroke="currentColor" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default IconSpotlightStroke
