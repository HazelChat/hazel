// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconSpotlight1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g clip-path="url(#icon-74tlb2pu3-a)">
				<path
					fill="currentColor"
					d="M23 20.5001c0 .8284-3.134 1.9999-7 1.9999s-7-1.1715-7-1.9999S12.134 18.5 16 18.5c2.6631 0 4.9789.556 6.1622 1.1727.5344.2786.8378.5696.8378.8274Z"
					opacity=".28"
				/>
				<path
					stroke="currentColor"
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M8.9998 20.4998c0 .8284 3.134 2 7 2s7-1.1716 7-2c0-.2577-.3034-.5487-.8378-.8273m-13.1622.8273c0-.8284 3.134-2 7-2 2.6632 0 4.9789.5559 6.1622 1.1727m-13.1622.8273-4.2819-10.5m4.6102-3L22.162 19.6725M5.4666 2.6811l1.1471 1.6384-3.2765 2.2943L2.19 4.9754c-.6336-.9049-.4137-2.152.4911-2.7855.9049-.6336 2.152-.4137 2.7855.4911Z"
				/>
			</g>
			<defs>
				<clipPath id="icon-74tlb2pu3-a">
					<path fill="currentColor" d="M0 0h24v24H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default IconSpotlight1
