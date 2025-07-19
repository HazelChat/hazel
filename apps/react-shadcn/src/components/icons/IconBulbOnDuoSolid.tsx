// icons/svgs/duo-solid/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconBulbOnDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 3.994c-3.657 0-6.687 2.863-6.687 6.474 0 1.975.913 3.735 2.335 4.915q.646.537.787 1.075l.228.875a2.22 2.22 0 0 0 2.147 1.661h2.38a2.22 2.22 0 0 0 2.148-1.66l.227-.876q.141-.538.788-1.075c1.421-1.18 2.335-2.94 2.335-4.915 0-3.611-3.03-6.474-6.688-6.474Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10.379 21h3.242M12 2V1m7 3.707L19.707 4m-15 .707L4 4m18 7h-1M3 11H2"
			/>
		</svg>
	)
}

export default IconBulbOnDuoSolid
