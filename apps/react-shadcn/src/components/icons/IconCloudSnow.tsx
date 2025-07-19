// icons/svgs/solid/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconCloudSnow: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19.465 6.715a7.502 7.502 0 0 0-14.348 1.46 5.502 5.502 0 0 0-.11 10.62A3 3 0 0 1 5.763 17 3 3 0 0 1 5 15.001V15a3 3 0 0 1 5.895-.79 3 3 0 0 1 2.21 0A3.001 3.001 0 0 1 19 15v.001a3 3 0 0 1-1.34 2.5c.425.282.774.671 1.01 1.128a6.503 6.503 0 0 0 .795-11.914Z"
				fill="currentColor"
			/>
			<path d="M8 14a1 1 0 0 1 1 1v.001a1 1 0 1 1-2 0V15a1 1 0 0 1 1-1Z" fill="currentColor" />
			<path d="M16 14a1 1 0 0 1 1 1v.001a1 1 0 1 1-2 0V15a1 1 0 0 1 1-1Z" fill="currentColor" />
			<path d="M12 16a1 1 0 0 1 1 1v.001a1 1 0 1 1-2 0V17a1 1 0 0 1 1-1Z" fill="currentColor" />
			<path d="M8 18a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" fill="currentColor" />
			<path d="M16 19a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" fill="currentColor" />
			<path d="M12 20a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" fill="currentColor" />
		</svg>
	)
}

export default IconCloudSnow
