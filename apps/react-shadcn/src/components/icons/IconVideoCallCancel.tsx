// icons/svgs/solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconVideoCallCancel: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M17.704 7.302A5 5 0 0 0 13 4H6a5 5 0 0 0-5 5v6a5 5 0 0 0 5 5h7a5 5 0 0 0 4.704-3.302l.366.307c1.952 1.64 4.93.252 4.93-2.297V9.292c0-2.55-2.978-3.937-4.93-2.297zm.297 2.778v3.835a1 1 0 0 0 .356.719l1 .84A1 1 0 0 0 21 14.708V9.292a1 1 0 0 0-1.643-.766l-1 .84a1 1 0 0 0-.356.714ZM7.707 8.793a1 1 0 0 0-1.414 1.414L8.086 12l-1.793 1.793a1 1 0 1 0 1.414 1.414L9.5 13.414l1.793 1.793a1 1 0 0 0 1.414-1.414L10.914 12l1.793-1.793a1 1 0 0 0-1.414-1.414L9.5 10.586z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconVideoCallCancel
