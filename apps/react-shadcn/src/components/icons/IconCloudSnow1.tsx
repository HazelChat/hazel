// icons/svgs/contrast/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconCloudSnow1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M5 15.001c0 .768.289 1.469.763 2a3 3 0 0 0-.523.82 4.502 4.502 0 0 1 .777-8.795 6.5 6.5 0 0 1 12.651-1.582 5.501 5.501 0 0 1-.168 10.181v-.965c.316-.475.5-1.046.5-1.659V15a3 3 0 0 0-5.895-.79A3 3 0 0 0 12 14c-.39 0-.763.075-1.105.21A3.001 3.001 0 0 0 5 15z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6.017 9.026A7 7 0 0 0 6 9.5m.017-.474a4.5 4.5 0 0 0-1.706 8.407m1.706-8.407a6.5 6.5 0 0 1 12.651-1.582 5.501 5.501 0 0 1 .652 9.779M8 15v.01m4 .99v.01M16 15v.01M8 19v.01m4 .99v.01M16 19v.01"
			/>
		</svg>
	)
}

export default IconCloudSnow1
