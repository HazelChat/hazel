// icons/svgs/stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconVolumeOffStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m22 2-5 5m0 0V5.107c0-1.71-1.934-2.706-3.326-1.711L10.86 5.405a4.9 4.9 0 0 1-1.899.822A4.93 4.93 0 0 0 5 11.061v1.918a4.93 4.93 0 0 0 2.032 3.989M17 7l-9.968 9.968m0 0L2 22m15-9.352v6.284c0 1.711-1.934 2.707-3.326 1.712l-2.724-1.946"
				fill="none"
			/>
		</svg>
	)
}

export default IconVolumeOffStroke
