// icons/svgs/solid/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconCloudSun: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10.652 1.025a1 1 0 0 1 .755 1.196l-.023.097a1 1 0 1 1-1.95-.44l.022-.098a1 1 0 0 1 1.196-.755Zm2.945 6.052a6.39 6.39 0 0 0-6.297 5.33 4.651 4.651 0 0 0 1.097 9.17h8.667A5.517 5.517 0 0 0 19.54 11.13a6.385 6.385 0 0 0-5.944-4.053ZM5.958 2.38a1 1 0 1 0-1.69 1.068l.053.085a1 1 0 1 0 1.69-1.068zM4.011 7.726a5 5 0 0 1 8.514-2.329l-.11.015a8.14 8.14 0 0 0-6.594 5.655 6.4 6.4 0 0 0-1.056.59 5 5 0 0 1-.754-3.931Zm-.166 4.327a1 1 0 0 1 .116.26 6.4 6.4 0 0 0-1.057 1.328 1 1 0 0 1-.523-1.846l.085-.053a1 1 0 0 1 1.379.311Zm11.865-6.45a1 1 0 0 0-1.405-1.336l-.085.054a1 1 0 0 0-.453 1.007c.671.014 1.322.11 1.943.276Zm-13.49.744a1 1 0 1 0-.44 1.951l.097.022a1 1 0 1 0 .441-1.95z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCloudSun
