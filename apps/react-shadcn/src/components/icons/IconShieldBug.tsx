// icons/svgs/solid/development

import type React from "react"
import type { SVGProps } from "react"

export const IconShieldBug: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.657 10.018q.072.099.133.207c.202.355.321.778.321 1.237 0 .319-.057.62-.16.892-.33.881-1.107 1.441-1.95 1.441-.845 0-1.621-.56-1.952-1.44a2.5 2.5 0 0 1-.16-.893 2.5 2.5 0 0 1 .454-1.444z"
				fill="currentColor"
			/>
			<path
				fillRule="evenodd"
				d="M10.544 1.427a4 4 0 0 1 2.717 0l5.465 1.974a4 4 0 0 1 2.63 3.455l.227 2.95a12 12 0 0 1-6.25 11.473l-1.488.806a4 4 0 0 1-3.887-.042l-1.52-.867A12 12 0 0 1 2.39 10.29l.127-3.309a4 4 0 0 1 2.639-3.608zM12 6.24c1.102 0 2.025.763 2.27 1.79a1 1 0 0 1 .55.278q.084.083.162.17A.3.3 0 0 0 15 8.369v-.812a1 1 0 1 1 2 0v.812c0 .798-.404 1.517-1.036 1.94a4.6 4.6 0 0 1 .117 1.68 2.33 2.33 0 0 1 1.364 2.122v1.129a1 1 0 0 1-2 0v-1.13a.33.33 0 0 0-.06-.189c-.73 1.116-1.958 1.874-3.385 1.874s-2.654-.758-3.385-1.874a.33.33 0 0 0-.06.19v1.129a1 1 0 1 1-2 0v-1.13c0-.928.548-1.75 1.364-2.122a4.6 4.6 0 0 1 .117-1.68A2.33 2.33 0 0 1 7 8.37v-.812a1 1 0 1 1 2 0v.812q0 .057.018.109.08-.087.162-.17a1 1 0 0 1 .55-.278A2.334 2.334 0 0 1 12 6.24Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconShieldBug
