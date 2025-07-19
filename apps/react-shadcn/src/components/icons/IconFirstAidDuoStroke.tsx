// icons/svgs/duo-stroke/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconFirstAidDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16 7v-.8c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C14.48 3 13.92 3 12.8 3h-1.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C8 4.52 8 5.08 8 6.2V7m2 0h4c1.861 0 2.792 0 3.545.245a5 5 0 0 1 3.21 3.21C21 11.208 21 12.139 21 14s0 2.792-.245 3.545a5 5 0 0 1-3.21 3.21C16.792 21 15.861 21 14 21h-4c-1.861 0-2.792 0-3.545-.245a5 5 0 0 1-3.21-3.21C3 16.792 3 15.861 3 14s0-2.792.245-3.545a5 5 0 0 1 3.21-3.21C7.208 7 8.139 7 10 7Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 17v-3m0 0v-3m0 3H9m3 0h3"
				fill="none"
			/>
		</svg>
	)
}

export default IconFirstAidDuoStroke
