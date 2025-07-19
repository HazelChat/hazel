// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconRepeatSquareStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 2a15.3 15.3 0 0 1 2.92 2.777c.054.066.08.145.08.225M12 8a15.3 15.3 0 0 0 2.92-2.777.36.36 0 0 0 .08-.221M12 16a15.3 15.3 0 0 0-2.92 2.777.36.36 0 0 0-.08.221M12 22a15.3 15.3 0 0 1-2.92-2.777.36.36 0 0 1-.08-.225m6-13.996q-.449-.003-1-.002h-4c-1.861 0-2.792 0-3.545.245a5 5 0 0 0-3.21 3.21C3 9.208 3 10.139 3 12s0 2.792.245 3.545A5 5 0 0 0 5 18m4 .998Q9.449 19 10 19h4c1.861 0 2.792 0 3.545-.245a5 5 0 0 0 3.21-3.21C21 14.792 21 13.861 21 12s0-2.792-.245-3.545A5 5 0 0 0 19 6"
				fill="none"
			/>
		</svg>
	)
}

export default IconRepeatSquareStroke
