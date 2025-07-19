// icons/svgs/duo-stroke/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconSnowflakeDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 6v6m0 0v6m0-6 5.196-3M12 12l-5.196 3M12 12 6.804 9M12 12l5.196 3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m9 3 3 3 3-3m0 18-3-3-3 3m9.295-16.098L17.196 9l4.098 1.098m-15.588 9L6.804 15l-4.098-1.098m0-3.804L6.804 9 5.706 4.902m15.588 9L17.197 15l1.098 4.098"
				fill="none"
			/>
		</svg>
	)
}

export default IconSnowflakeDuoStroke
