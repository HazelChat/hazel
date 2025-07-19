// icons/svgs/duo-stroke/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconSyringeInjectionDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12.024 3.254a1 1 0 0 1 1.414 0l7.307 7.308a1 1 0 1 1-1.414 1.414l-.754-.754-7.796 7.795c-.285.285-.54.54-.769.735-.245.208-.525.405-.878.52a2.55 2.55 0 0 1-1.576 0c-.353-.115-.633-.312-.878-.52a14 14 0 0 1-.77-.735l-.928-.928c-.284-.285-.54-.54-.734-.769-.208-.245-.405-.526-.52-.878a2.55 2.55 0 0 1 0-1.576c.115-.353.312-.633.52-.878.194-.23.45-.484.734-.77l7.796-7.795-.755-.754a1 1 0 0 1 0-1.415Zm2.168 3.583-7.77 7.77c-.318.319-.514.516-.65.675-.125.148-.14.199-.142.202a.55.55 0 0 0 0 .34c.001.003.017.054.143.202.135.159.33.356.65.675l.876.877c.319.318.516.514.675.65.148.125.199.14.202.141a.55.55 0 0 0 .34 0c.003 0 .054-.016.202-.142.16-.135.356-.33.675-.65l7.77-7.77z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M19.293 1.802a1 1 0 0 0-1.433 1.396l.754.774-2.23 2.23L17.8 7.614l2.23-2.23.773.754a1 1 0 1 0 1.396-1.432l-1.471-1.433z"
			/>
			<path fill="currentColor" d="m6.851 17.13.02.019z" />
			<path
				fill="currentColor"
				d="m4.74 17.846.242.243.929.928.243.243-2.947 2.947a1 1 0 0 1-1.414-1.414z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m10.538 9.077 2.193 2.192M7.615 12l2.193 2.192"
			/>
		</svg>
	)
}

export default IconSyringeInjectionDuoStroke
