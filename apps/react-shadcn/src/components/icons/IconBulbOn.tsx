// icons/svgs/solid/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconBulbOn: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M12 0a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V1a1 1 0 0 1 1-1Z" fill="currentColor" />
			<path
				d="M3.293 3.293a1 1 0 0 1 1.414 0L5.414 4A1 1 0 1 1 4 5.414l-.707-.707a1 1 0 0 1 0-1.414Z"
				fill="currentColor"
			/>
			<path
				d="M20.414 3.293a1 1 0 0 1 0 1.414l-.707.707A1 1 0 1 1 18.293 4L19 3.293a1 1 0 0 1 1.414 0Z"
				fill="currentColor"
			/>
			<path d="M1 11a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H2a1 1 0 0 1-1-1Z" fill="currentColor" />
			<path d="M20 11a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1Z" fill="currentColor" />
			<path d="M9.379 21a1 1 0 0 1 1-1h3.242a1 1 0 1 1 0 2h-3.242a1 1 0 0 1-1-1Z" fill="currentColor" />
			<path
				d="M5.313 10.468c0-3.611 3.03-6.474 6.687-6.474s6.688 2.863 6.688 6.474c0 1.975-.914 3.735-2.335 4.915q-.647.537-.788 1.075l-.227.875a2.22 2.22 0 0 1-2.148 1.661h-2.38a2.22 2.22 0 0 1-2.147-1.66l-.228-.876c-.093-.358-.358-.718-.787-1.075-1.422-1.18-2.335-2.94-2.335-4.915Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBulbOn
