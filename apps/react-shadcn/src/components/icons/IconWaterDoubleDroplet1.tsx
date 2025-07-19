// icons/svgs/contrast/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconWaterDoubleDroplet1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M17.078 8.396c.086.126.003.299-.147.327a3 3 0 0 0-1.455.729c-3.445 3.137-5.136 6.56-4.256 9.808.123.454.29.876.492 1.265.109.21-.038.472-.274.453C5.834 20.543-.584 13.644 11.996 3c2.277 1.927 3.932 3.731 5.082 5.396Zm.422 3.274c6.262 5.704 2.752 9.333 0 9.333s-6.262-3.63 0-9.333Z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17.5 11.67c6.262 5.704 2.752 9.333 0 9.333s-6.262-3.63 0-9.333Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16.62 7.755C15.5 6.271 13.987 4.682 12 3-.083 13.224 5.36 19.992 10.775 20.896"
			/>
		</svg>
	)
}

export default IconWaterDoubleDroplet1
