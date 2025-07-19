// icons/svgs/duo-stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconBugDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21 3v2.54a3 3 0 0 1-2.412 2.942l-.606.122M3 3v2.54a3 3 0 0 0 2.412 2.942l.606.122M22 21v-2.54a3 3 0 0 0-2.412-2.942l-1.092-.219M2 21v-2.54a3 3 0 0 1 2.412-2.942l1.092-.219M12 20v-7"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14.83 7a3 3 0 1 0-5.66 0m5.658 0h1.93c.473.47.886 1.01 1.223 1.604A7.87 7.87 0 0 1 19 12.5a8 8 0 0 1-.504 2.8C17.461 18.054 14.942 20 12 20s-5.46-1.945-6.496-4.7A8 8 0 0 1 5 12.5c0-1.427.372-2.76 1.018-3.896A7.5 7.5 0 0 1 7.24 7h1.93m5.658 0H9.171"
				fill="none"
			/>
		</svg>
	)
}

export default IconBugDuoStroke
