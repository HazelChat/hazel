// icons/svgs/duo-stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconScaleDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.344 6.202 17.8 3.656c-.792-.792-1.188-1.188-1.645-1.336a2 2 0 0 0-1.236 0c-.457.148-.853.544-1.645 1.336l-9.617 9.617c-.792.792-1.188 1.188-1.336 1.644a2 2 0 0 0 0 1.236c.148.457.544.853 1.336 1.645l2.546 2.546c.792.792 1.188 1.188 1.645 1.336.401.13.834.13 1.236 0 .457-.148.853-.544 1.645-1.336l9.616-9.617c.792-.792 1.188-1.188 1.337-1.645a2 2 0 0 0 0-1.236c-.149-.456-.545-.852-1.337-1.644Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m3.722 12.707 3.535 3.536M9.38 7.05l3.536 3.536m-.708-6.364 2.121 2.121M6.55 9.88 8.67 12"
				fill="none"
			/>
		</svg>
	)
}

export default IconScaleDuoStroke
