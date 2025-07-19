// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconChevronBigUp1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.51 9.183A30.6 30.6 0 0 1 18 15a72 72 0 0 0-12 0 30.6 30.6 0 0 1 5.49-5.817.8.8 0 0 1 1.02 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12.51 9.183A30.6 30.6 0 0 1 18 15a72 72 0 0 0-12 0 30.6 30.6 0 0 1 5.49-5.817.8.8 0 0 1 1.02 0Z"
			/>
		</svg>
	)
}

export default IconChevronBigUp1
