// icons/svgs/solid/time

import type React from "react"
import type { SVGProps } from "react"

export const IconCalendarCancel: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9 2a1 1 0 0 0-2 0v1.305a5 5 0 0 0-.679.228A7 7 0 0 0 2.533 7.32c-.318.768-.439 1.605-.491 2.628C2 10.762 2 11.75 2 12.974v.063c0 1.366 0 2.443.06 3.314.06.888.186 1.634.473 2.328a7 7 0 0 0 3.788 3.788c.694.287 1.44.413 2.328.474.87.059 1.948.059 3.314.059h.074c1.366 0 2.443 0 3.314-.06.888-.06 1.634-.186 2.328-.473a7 7 0 0 0 3.788-3.788c.287-.694.413-1.44.474-2.328.059-.87.059-1.947.059-3.314v-.063c0-1.223 0-2.212-.042-3.025-.052-1.023-.173-1.86-.49-2.628a7 7 0 0 0-3.79-3.788A5 5 0 0 0 17 3.305V2a1 1 0 1 0-2 0v1.04C14.195 3 13.241 3 12.084 3h-.168C10.759 3 9.805 3 9 3.04zm1.207 8.793a1 1 0 0 0-1.414 1.414L10.586 14l-1.793 1.793a1 1 0 1 0 1.414 1.414L12 15.414l1.793 1.793a1 1 0 0 0 1.414-1.414L13.414 14l1.793-1.793a1 1 0 0 0-1.414-1.414L12 12.586z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCalendarCancel
