// icons/svgs/solid/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconChartCandlestick: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M12 2a1 1 0 0 1 1 1v2.05a2.5 2.5 0 0 1 2 2.45v9a2.5 2.5 0 0 1-2 2.45V21a1 1 0 1 1-2 0v-2.05a2.5 2.5 0 0 1-2-2.45v-9a2.5 2.5 0 0 1 2-2.45V3a1 1 0 0 1 1-1Zm7 1a1 1 0 0 1 1 1v2.05a2.5 2.5 0 0 1 2 2.45v4a2.5 2.5 0 0 1-2 2.45V17a1 1 0 1 1-2 0v-2.05a2.5 2.5 0 0 1-2-2.45v-4a2.5 2.5 0 0 1 2-2.45V4a1 1 0 0 1 1-1ZM5 6a1 1 0 0 1 1 1v2.05a2.5 2.5 0 0 1 2 2.45v4a2.5 2.5 0 0 1-2 2.45V20a1 1 0 1 1-2 0v-2.05a2.5 2.5 0 0 1-2-2.45v-4a2.5 2.5 0 0 1 2-2.45V7a1 1 0 0 1 1-1Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconChartCandlestick
