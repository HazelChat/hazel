// icons/svgs/stroke/security

import type React from "react"
import type { SVGProps } from "react"

export const IconLock02OpenStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13 10.183V7.5a4.5 4.5 0 1 1 9 0V10m-9 .183C12.397 10 11.584 10 10.2 10H6.8c-1.384 0-2.197 0-2.8.183a2 2 0 0 0-.362.144 3 3 0 0 0-1.311 1.311C2 12.28 2 13.12 2 14.8v1.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 21 5.12 21 6.8 21h3.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C15 18.72 15 17.88 15 16.2v-1.4c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311 2 2 0 0 0-.362-.144Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconLock02OpenStroke
