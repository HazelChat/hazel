// icons/svgs/stroke/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconMapPinUserStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17.14 18.096a2.88 2.88 0 0 0-2.25-1.078H9.111c-.91 0-1.722.42-2.252 1.078m10.28 0c1.473-1.753 2.65-4.107 2.65-6.874C19.79 5.056 14.922 3 12 3c-2.92 0-7.79 2.056-7.79 8.222 0 2.767 1.177 5.12 2.65 6.874m10.28 0C15.332 20.251 13.075 21.5 12 21.5s-3.33-1.25-5.14-3.404m8.062-7.306a2.921 2.921 0 1 1-5.843 0 2.921 2.921 0 0 1 5.842 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMapPinUserStroke
