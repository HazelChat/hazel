// icons/svgs/duo-solid/chart-&-graph

import type React from "react"
import type { SVGProps } from "react"

export const IconTrendlineDownDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m2 7.148.73.937a21.8 21.8 0 0 0 6.61 5.664c.316.176.715.08.916-.222l3.212-4.818a.64.64 0 0 1 .926-.15 20 20 0 0 1 4.848 5.45"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M22.512 11.316a1 1 0 0 1 .479.978 18.3 18.3 0 0 1-1.188 4.632 1.476 1.476 0 0 1-1.578.911 18.3 18.3 0 0 1-4.606-1.287 1 1 0 0 1-.03-1.826l1.274-.595a22.7 22.7 0 0 0 3.41-1.968l1.152-.806a1 1 0 0 1 1.087-.039Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconTrendlineDownDuoSolid
