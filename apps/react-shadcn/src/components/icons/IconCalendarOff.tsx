// icons/svgs/solid/time

import type React from "react"
import type { SVGProps } from "react"

export const IconCalendarOff: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9 2a1 1 0 0 0-2 0v1.305a5 5 0 0 0-.679.228A7 7 0 0 0 2.533 7.32c-.214.518-.339 1.065-.413 1.68h11.466l-2 2H2.009C2 11.581 2 12.235 2 12.974v.063c0 1.366 0 2.443.06 3.314.06.888.186 1.634.473 2.328q.197.477.46.914l-1.7 1.7a1 1 0 1 0 1.414 1.414l20-20a1 1 0 0 0-1.414-1.414l-2.7 2.7a7 7 0 0 0-.914-.46A5 5 0 0 0 17 3.305V2a1 1 0 1 0-2 0v1.04C14.195 3 13.241 3 12.084 3h-.168C10.759 3 9.805 3 9 3.04z"
				fill="currentColor"
			/>
			<path
				d="M21.83 8.649a1 1 0 0 0-1.693-.548L7.1 21.137a1 1 0 0 0 .548 1.694c1.045.17 2.384.17 4.248.169h.14c1.366 0 2.443 0 3.314-.06.888-.06 1.634-.186 2.328-.473a7 7 0 0 0 3.788-3.788c.287-.694.413-1.44.474-2.328.059-.87.059-1.947.059-3.314v-.063c0-1.223 0-2.212-.042-3.025a12 12 0 0 0-.127-1.3Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCalendarOff
