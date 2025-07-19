// icons/svgs/stroke/building

import type React from "react"
import type { SVGProps } from "react"

export const IconDoorOpenStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 20h9m8 0h3"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 20V7.98c0-1.4 0-2.1.272-2.635a2.5 2.5 0 0 1 1.093-1.092C6.9 3.98 7.6 3.98 9 3.98h2"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11 20.714V3.309c0-.776 0-1.164.163-1.413a1 1 0 0 1 .619-.429c.29-.065.653.071 1.38.344l3.242 1.216c.936.35 1.404.526 1.749.83.305.268.54.607.684.986.163.43.163.93.163 1.93v10.511c0 1.009 0 1.513-.166 1.946a2.5 2.5 0 0 1-.693.99c-.35.304-.823.477-1.77.822l-3.223 1.175c-.723.263-1.084.395-1.373.329a1 1 0 0 1-.614-.43C11 21.867 11 21.483 11 20.714Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14.947 11.618h-.918"
				fill="none"
			/>
		</svg>
	)
}

export default IconDoorOpenStroke
