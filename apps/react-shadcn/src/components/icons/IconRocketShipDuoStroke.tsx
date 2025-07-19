// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconRocketShipDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11.359 6.148H6.98c-.327 0-.543.06-.823.228L4.344 7.465c-.433.26-.65.39-.712.549a.5.5 0 0 0 .029.424c.083.15.315.25.78.448l3.473 1.489m5.711 5.71 1.489 3.475c.199.464.298.696.448.779a.5.5 0 0 0 .424.029c.16-.062.29-.279.55-.712l1.088-1.814c.168-.28.228-.496.228-.823v-4.378m-9.9 7.65-.707.707m-3.535-4.95-.708.707"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m5.83 18.169-2.828 2.828M20.68 3.32c-.308-.309-1.127-.363-2.125-.287-1.162.088-1.743.132-3.048.572-.895.302-2.461 1.14-3.209 1.717-1.09.842-1.763 1.701-3.108 3.42l-.865 1.104c-.591.756-.887 1.134-1.045 1.523a3 3 0 0 0 .157 2.586c.204.367.543.707 1.222 1.385.679.68 1.018 1.019 1.386 1.223a3 3 0 0 0 2.586.157c.389-.159.767-.454 1.523-1.046l1.104-.864c1.718-1.345 2.578-2.018 3.42-3.109.577-.747 1.415-2.313 1.716-3.208.44-1.306.485-1.887.573-3.048.076-.999.021-1.817-.287-2.125Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconRocketShipDuoStroke
