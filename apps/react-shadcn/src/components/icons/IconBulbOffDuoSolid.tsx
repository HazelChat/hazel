// icons/svgs/duo-solid/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconBulbOffDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 3.994c-3.657 0-6.687 2.863-6.687 6.474 0 1.975.913 3.735 2.335 4.915q.646.537.787 1.075l.227.876a2.22 2.22 0 0 0 2.148 1.66h2.38a2.22 2.22 0 0 0 2.148-1.66l.227-.876c.093-.358.358-.718.787-1.075 1.422-1.18 2.335-2.94 2.335-4.915 0-3.611-3.03-6.474-6.687-6.474Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10.379 21h3.242"
			/>
		</svg>
	)
}

export default IconBulbOffDuoSolid
