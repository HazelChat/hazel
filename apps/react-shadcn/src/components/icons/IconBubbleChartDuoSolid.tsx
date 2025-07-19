// icons/svgs/duo-solid/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconBubbleChartDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M6 10.1a3.9 3.9 0 1 0 0 7.8 3.9 3.9 0 0 0 0-7.8Z" />
				<path fill="currentColor" d="M13.5 15.1a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Z" />
			</g>
			<path fill="currentColor" d="M15.5 3.1a5.4 5.4 0 1 0 0 10.8 5.4 5.4 0 0 0 0-10.8Z" />
		</svg>
	)
}

export default IconBubbleChartDuoSolid
