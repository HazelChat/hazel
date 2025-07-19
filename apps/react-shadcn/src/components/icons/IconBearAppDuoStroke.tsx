// icons/svgs/duo-stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconBearAppDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10.965 4.236c-.363-.589-1.858-1.472-2.605-1.177-.629.247-.567 1.087-.567 2.378C6.661 7 6.34 7.181 5.505 9.04 4.357 11.599 3.15 14.702 2.425 21h15.404c-.929-1.903-2.288-3.013-3.104-6.366-.576-2.37 2.832-1.835 4.1-2.31 1.677-.629 2.52-1.971 2.674-2.923.302-1.88-.34-1.506-1.088-1.63-1.087-.182-3.058-1.179-4.576-2.674-1.036-1.02-2.65-1.042-4.87-.86Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5.505 9.039C6.34 7.181 6.661 7 7.793 5.437c0-1.291-.062-2.13.567-2.379.747-.294 2.242.59 2.605 1.178 2.22-.18 3.834-.16 4.87.861 1.518 1.495 3.489 2.492 4.576 2.673.748.125 1.39-.249 1.088 1.631-.153.952-.997 2.294-2.673 2.923-1.269.476-4.677-.06-4.1 2.31"
				fill="none"
			/>
		</svg>
	)
}

export default IconBearAppDuoStroke
