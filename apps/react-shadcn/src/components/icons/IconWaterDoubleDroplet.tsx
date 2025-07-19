// icons/svgs/solid/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconWaterDoubleDroplet: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.354 2.237a1 1 0 0 1 1.292 0c2.77 2.345 4.7 4.566 5.923 6.63a3 3 0 0 0-3.09.585c-3.444 3.137-5.134 6.56-4.255 9.808a6.2 6.2 0 0 0 1.525 2.705 8 8 0 0 1-.75.035c-3.177 0-6.91-1.936-7.976-5.595-1.082-3.71.738-8.59 7.33-14.168Zm5.473 8.694a1 1 0 0 1 1.346 0c3.236 2.947 4.258 5.643 3.673 7.806-.577 2.13-2.598 3.266-4.346 3.266s-3.77-1.137-4.345-3.266c-.586-2.163.436-4.86 3.672-7.806Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconWaterDoubleDroplet
