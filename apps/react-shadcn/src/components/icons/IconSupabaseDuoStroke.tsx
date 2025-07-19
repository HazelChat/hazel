// icons/svgs/duo-stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconSupabaseDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeWidth="2"
				d="M11.016 3.356V15H6.76c-2.085 0-3.127 0-3.672-.43a2 2 0 0 1-.761-1.544c-.01-.694.625-1.52 1.895-3.174L9.58 2.869c.438-.57.657-.856.85-.889a.5.5 0 0 1 .452.153c.133.144.133.504.133 1.223Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeWidth="2"
				d="M13 20.641V9h4.246c2.084 0 3.125 0 3.67.43a2 2 0 0 1 .762 1.543c.009.693-.625 1.52-1.892 3.174l-5.351 6.98c-.438.573-.657.858-.85.892a.5.5 0 0 1-.452-.154C13 21.722 13 21.361 13 20.641Z"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconSupabaseDuoStroke
