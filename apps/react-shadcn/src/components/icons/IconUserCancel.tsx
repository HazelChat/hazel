// icons/svgs/solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserCancel: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M11 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" fill="currentColor" />
			<path
				d="M13.17 14H7a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 2.529-1.385 3 3 0 0 1-.65-.494l-.379-.378-.379.378a3 3 0 1 1-4.242-4.242l.378-.379-.378-.379A3 3 0 0 1 13.17 14Z"
				fill="currentColor"
			/>
			<path
				d="m18.5 14.086-1.793-1.793a1 1 0 0 0-1.414 1.414l1.793 1.793-1.793 1.793a1 1 0 0 0 1.414 1.414l1.793-1.793 1.793 1.793a1 1 0 0 0 1.414-1.414L19.914 15.5l1.793-1.793a1 1 0 0 0-1.414-1.414z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconUserCancel
