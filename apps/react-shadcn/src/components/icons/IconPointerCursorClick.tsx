// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPointerCursorClick: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M11.998 2.304a1 1 0 1 0-2 0V4.88a1 1 0 1 0 2 0z" fill="currentColor" />
			<path d="M5.21 3.8a1 1 0 0 0-1.414 1.414L5.961 7.38a1 1 0 0 0 1.414-1.414z" fill="currentColor" />
			<path
				d="M18.083 5.473a1 1 0 1 0-1.36-1.466l-1.517 1.407a1 1 0 1 0 1.36 1.466z"
				fill="currentColor"
			/>
			<path
				d="M14.33 8.957c-.883-.221-1.612-.403-2.2-.494-.596-.093-1.202-.12-1.774.104a3.17 3.17 0 0 0-1.793 1.793c-.224.572-.197 1.178-.104 1.774.09.588.273 1.317.494 2.2l.901 3.606c.193.77.344 1.375.475 1.827.122.42.262.846.473 1.156a3.165 3.165 0 0 0 5.09.19c.233-.294.404-.708.557-1.118.164-.441.36-1.034.609-1.787l.007-.021c.1-.302.124-.368.15-.422a1.16 1.16 0 0 1 .546-.547c.054-.025.12-.05.422-.15l.021-.006c.753-.25 1.346-.445 1.787-.61.41-.152.824-.323 1.117-.557a3.165 3.165 0 0 0-.19-5.09c-.309-.21-.735-.35-1.155-.472-.452-.131-1.057-.282-1.827-.475z"
				fill="currentColor"
			/>
			<path d="M2.3 10.002a1 1 0 1 0 0 2h2.575a1 1 0 0 0 0-2z" fill="currentColor" />
			<path
				d="M6.876 16.57a1 1 0 1 0-1.466-1.36l-1.407 1.517a1 1 0 1 0 1.466 1.36z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPointerCursorClick
