// icons/svgs/contrast/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconBulbOff1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 4.994c-3.141 0-5.687 2.451-5.687 5.474 0 1.657.765 3.142 1.973 4.146.511.424.95.95 1.117 1.593l.227.875c.14.537.625.912 1.18.912h2.38a1.22 1.22 0 0 0 1.18-.912l.227-.875c.167-.643.606-1.169 1.117-1.593 1.208-1.004 1.973-2.489 1.973-4.146 0-3.023-2.546-5.474-5.687-5.474Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10.379 21h3.242M6.313 10.468c0-3.023 2.546-5.474 5.687-5.474s5.688 2.451 5.688 5.474c0 1.657-.766 3.142-1.974 4.146-.511.424-.95.95-1.117 1.593l-.227.875a1.22 1.22 0 0 1-1.18.912h-2.38a1.22 1.22 0 0 1-1.18-.912l-.227-.875c-.167-.643-.606-1.169-1.117-1.593-1.208-1.004-1.973-2.489-1.973-4.146Z"
			/>
		</svg>
	)
}

export default IconBulbOff1
