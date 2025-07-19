// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconGraduationHatStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 7.847q0-.145.067-.277c.098-.193.387-.336.965-.621l6.064-2.992c1.063-.524 1.594-.786 2.154-.889a4.2 4.2 0 0 1 1.5 0c.56.103 1.091.365 2.153.89l6.065 2.99c.578.286.867.429.965.622a.61.61 0 0 1 .01.534c-.092.197-.376.348-.944.65l-5.918 3.153c-1.123.599-1.685.898-2.281 1.015a4.2 4.2 0 0 1-1.6 0c-.596-.117-1.157-.416-2.281-1.015L3.001 8.755c-.568-.303-.852-.454-.944-.65A.6.6 0 0 1 2 7.846Zm0 0V15m3-5.18v6.316c0 .338 0 .507.05.658a1 1 0 0 0 .209.361c.107.118.254.202.547.37l.637.364c2.026 1.157 3.038 1.736 4.114 1.963a7 7 0 0 0 2.886 0c1.076-.227 2.088-.806 4.114-1.963l.637-.364c.293-.168.44-.252.547-.37a1 1 0 0 0 .21-.36c.049-.152.049-.312.049-.65V9.82"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraduationHatStroke
