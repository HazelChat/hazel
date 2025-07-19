// icons/svgs/duo-solid/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconCloudSunDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M11.58 2.394a1 1 0 0 0-1.951-.44l-.022.097a1 1 0 0 0 1.95.44zm-5.449.16a1 1 0 1 0-1.69 1.068l.052.085a1 1 0 1 0 1.692-1.068zM4.184 7.9a5 5 0 0 1 8.514-2.329l-.11.016a8.14 8.14 0 0 0-6.594 5.654 6.4 6.4 0 0 0-1.056.59 5 5 0 0 1-.754-3.93Zm-.166 4.328a1 1 0 0 1 .116.26 6.4 6.4 0 0 0-1.057 1.327 1 1 0 0 1-.523-1.846l.084-.053a1 1 0 0 1 1.38.312Zm11.865-6.45a1 1 0 0 0-1.405-1.336l-.085.053a1 1 0 0 0-.453 1.008c.67.014 1.322.109 1.943.275Zm-13.49.744a1 1 0 1 0-.44 1.95l.097.022a1 1 0 1 0 .441-1.95z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M13.77 7.25a6.39 6.39 0 0 0-6.297 5.33 4.651 4.651 0 0 0 1.097 9.17h8.667a5.517 5.517 0 0 0 2.477-10.447A6.385 6.385 0 0 0 13.77 7.25Z"
			/>
		</svg>
	)
}

export default IconCloudSunDuoSolid
