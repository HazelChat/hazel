// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconScissorsRightCutStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m18.708 19.264-7.388-7.389m0 0 7.388-7.389m-7.388 7.389-3.04 3.039m3.039-3.039L8.28 8.836m0 6.078a3.167 3.167 0 1 0-4.478 4.478 3.167 3.167 0 0 0 4.478-4.478Zm0-6.078a3.167 3.167 0 1 0-4.479-4.478A3.167 3.167 0 0 0 8.28 8.836Zm8.844 3.039h-1m5 0h-1"
				fill="none"
			/>
		</svg>
	)
}

export default IconScissorsRightCutStroke
