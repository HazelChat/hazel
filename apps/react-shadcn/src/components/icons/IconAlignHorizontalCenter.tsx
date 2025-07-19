// icons/svgs/solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconAlignHorizontalCenter: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13 5a1 1 0 1 0-2 0v7c0-.364-.14-.707-.38-.97a17.4 17.4 0 0 0-3.384-2.864 1 1 0 0 0-1.547.932q.093.95.126 1.902H3a1 1 0 1 0 0 2h2.815q-.033.953-.126 1.902a1 1 0 0 0 1.547.932 17.4 17.4 0 0 0 3.384-2.863c.24-.264.38-.607.38-.971v7a1 1 0 1 0 2 0v-7c0 .364.14.707.38.97a17.4 17.4 0 0 0 3.384 2.864 1 1 0 0 0 1.547-.932A30 30 0 0 1 18.185 13H21a1 1 0 1 0 0-2h-2.815q.033-.953.126-1.902a1 1 0 0 0-1.547-.932 17.4 17.4 0 0 0-3.384 2.863A1.44 1.44 0 0 0 13 12z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconAlignHorizontalCenter
