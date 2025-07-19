// icons/svgs/duo-stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconOperaBrowserDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21.149 12.138V12q0-.862-.153-1.68m.153 1.818a9.15 9.15 0 1 1-3.207-7.096m3.207 7.096a9.13 9.13 0 0 1-4.525 7.736A7.936 7.936 0 0 1 7.182 12 8.02 8.02 0 0 1 15.2 3.982q.725.002 1.439.133.694.408 1.303.927m3.207 7.096.001-.14a9 9 0 0 0-.154-1.678m-3.054-5.278A9.2 9.2 0 0 1 20.41 8.39m-2.468-3.35a9.1 9.1 0 0 1 2.468 3.35m0 0a9 9 0 0 1 .586 1.93m-.585-1.93c.266.62.462 1.267.585 1.93"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M15.614 17a8.02 8.02 0 0 0 0-10"
				fill="none"
			/>
		</svg>
	)
}

export default IconOperaBrowserDuoStroke
