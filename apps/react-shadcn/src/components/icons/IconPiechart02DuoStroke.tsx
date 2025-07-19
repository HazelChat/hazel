// icons/svgs/duo-stroke/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconPiechart02DuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m19.411 14.822-6.1-3.05a1.5 1.5 0 0 1-.744-.84l-2.28-6.43a7.424 7.424 0 0 1 9.125 10.32Zm0 0 .515.257"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3.269 11.5a9.5 9.5 0 0 0 17.224 5.534c.484-.673.175-1.584-.567-1.955l-6.616-3.308a1.5 1.5 0 0 1-.742-.84L10.093 3.96c-.277-.781-1.142-1.2-1.87-.802A9.5 9.5 0 0 0 3.27 11.5Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPiechart02DuoStroke
