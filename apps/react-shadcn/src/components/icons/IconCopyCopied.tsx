// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconCopyCopied: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.8 2h.4c1.669 0 2.748 0 3.654.294a6 6 0 0 1 3.852 3.852c.295.906.294 1.985.294 3.654v.4c0 1.669 0 2.748-.294 3.654a6 6 0 0 1-3.965 3.887l-.035.113a6 6 0 0 1-3.852 3.852c-.906.295-1.985.294-3.654.294h-.4c-1.669 0-2.748 0-3.654-.294a6 6 0 0 1-3.852-3.852C1.999 16.948 2 15.87 2 14.2v-.4c0-1.668 0-2.748.294-3.654a6 6 0 0 1 3.965-3.887l.035-.113a6 6 0 0 1 3.852-3.852C11.052 1.999 12.132 2 13.8 2ZM8.532 6.007C8.941 6 9.396 6 9.908 6h.292c1.669 0 2.748 0 3.654.294a6 6 0 0 1 3.852 3.852c.295.906.294 1.986.294 3.654v.292c0 .512 0 .967-.007 1.376a4 4 0 0 0 1.811-2.232C19.988 12.672 20 11.94 20 10s-.012-2.671-.196-3.236a4 4 0 0 0-2.568-2.568C16.672 4.012 15.94 4 14 4s-2.671.012-3.236.196a4 4 0 0 0-2.232 1.81Zm5.032 6.819a1 1 0 1 0-1.128-1.652 14 14 0 0 0-3.575 3.53l-1.154-1.153a1 1 0 1 0-1.414 1.415L8.33 17a1 1 0 0 0 1.575-.21 12 12 0 0 1 3.66-3.964Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCopyCopied
