// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconChevronBigRight1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.817 12.51A30.6 30.6 0 0 1 9 18 72 72 0 0 0 9 6a30.6 30.6 0 0 1 5.817 5.49c.244.3.244.72 0 1.02Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14.817 12.51A30.6 30.6 0 0 1 9 18 72 72 0 0 0 9 6a30.6 30.6 0 0 1 5.817 5.49c.244.3.244.72 0 1.02Z"
			/>
		</svg>
	)
}

export default IconChevronBigRight1
