// icons/svgs/solid/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconSyringeInjection: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17.87 1.793a1 1 0 0 1 1.414 0l2.923 2.923a1 1 0 0 1-1.414 1.414l-.755-.754-2.24 2.24 2.948 2.946a1 1 0 0 1-1.415 1.414l-.754-.754-7.796 7.795c-.285.285-.54.54-.769.735-.245.208-.525.405-.878.52a2.55 2.55 0 0 1-1.576 0c-.352-.115-.633-.312-.878-.52a10 10 0 0 1-.526-.492l-2.947 2.947a1 1 0 0 1-1.414-1.414l2.947-2.947a10 10 0 0 1-.492-.526c-.208-.245-.405-.526-.52-.878a2.55 2.55 0 0 1 0-1.576c.115-.353.312-.633.52-.878.195-.23.45-.484.735-.77L6.2 12l2.361 2.361a1 1 0 1 0 1.414-1.414l-2.36-2.361 1.508-1.509 2.361 2.361a1 1 0 0 0 1.414-1.414l-2.36-2.361 2.24-2.24-.755-.754a1 1 0 1 1 1.414-1.415l2.947 2.947 2.24-2.24-.755-.754a1 1 0 0 1 0-1.414Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSyringeInjection
