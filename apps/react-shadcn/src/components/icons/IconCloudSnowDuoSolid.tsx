// icons/svgs/duo-solid/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconCloudSnowDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.5 2a7.5 7.5 0 0 1 6.965 4.715 6.503 6.503 0 0 1-.796 11.915 3 3 0 0 0-1.01-1.13A3 3 0 0 0 19 15.001V15a3 3 0 0 0-5.895-.79A3 3 0 0 0 12 14c-.39 0-.763.075-1.105.21A3.001 3.001 0 0 0 5 15v.001c0 .768.289 1.469.763 2a3 3 0 0 0-.756 1.794 5.502 5.502 0 0 1 .11-10.62A7.5 7.5 0 0 1 7.434 3.97 7.47 7.47 0 0 1 12.5 2Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M9 15a1 1 0 1 0-2 0v.001a1 1 0 1 0 2 0z" />
			<path fill="currentColor" d="M17 15a1 1 0 1 0-2 0v.001a1 1 0 1 0 2 0z" />
			<path fill="currentColor" d="M13 17a1 1 0 1 0-2 0v.001a1 1 0 1 0 2 0z" />
			<path fill="currentColor" d="M9 19a1 1 0 1 0-2 0v.001a1 1 0 1 0 2 0z" />
			<path fill="currentColor" d="M17 20a1 1 0 1 0-2 0v.001a1 1 0 1 0 2 0z" />
			<path fill="currentColor" d="M13 21a1 1 0 1 0-2 0v.001a1 1 0 1 0 2 0z" />
		</svg>
	)
}

export default IconCloudSnowDuoSolid
