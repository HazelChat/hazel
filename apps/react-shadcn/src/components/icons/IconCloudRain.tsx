// icons/svgs/solid/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconCloudRain: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.5 2a7.5 7.5 0 0 1 6.965 4.715 6.502 6.502 0 0 1-.504 11.803A3 3 0 0 0 18.6 17.5c.255-.441.401-.954.401-1.5v-2a3 3 0 0 0-5.529-1.615A3 3 0 0 0 12 12c-.535 0-1.037.14-1.471.385A3 3 0 0 0 5 14v2c0 .546.146 1.059.401 1.5a3 3 0 0 0-.394 1.295 5.502 5.502 0 0 1 .11-10.62A7.5 7.5 0 0 1 7.434 3.97 7.47 7.47 0 0 1 12.5 2Z"
				fill="currentColor"
			/>
			<path d="M9 14a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0z" fill="currentColor" />
			<path d="M17 14a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0z" fill="currentColor" />
			<path d="M13 15a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0z" fill="currentColor" />
			<path d="M9 19a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0z" fill="currentColor" />
			<path d="M17 19a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0z" fill="currentColor" />
			<path d="M13 20a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0z" fill="currentColor" />
		</svg>
	)
}

export default IconCloudRain
