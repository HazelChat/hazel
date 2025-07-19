// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMinimizeLineArrowStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.745 5.599a20.7 20.7 0 0 0-.215 5.31.62.62 0 0 0 .177.384m5.694-.038a20.6 20.6 0 0 1-5.31.215.62.62 0 0 1-.384-.177m0 0L20 4m-8.744 14.401c.3-1.767.372-3.552.214-5.31a.62.62 0 0 0-.177-.384m-5.694.037c1.767-.3 3.552-.372 5.31-.214a.6.6 0 0 1 .384.177m0 0L4 20"
				fill="none"
			/>
		</svg>
	)
}

export default IconMinimizeLineArrowStroke
