// icons/svgs/duo-solid/medical

import type React from "react"
import type { SVGProps } from "react"

export const IconSyringeInjectionDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.438 3.254a1 1 0 1 0-1.415 1.415l.755.754-7.796 7.796c-.285.285-.54.54-.734.769-.208.245-.405.525-.52.878a2.55 2.55 0 0 0 0 1.576c.115.352.312.633.52.878.194.23.45.484.734.77l.929.927c.285.285.54.54.769.735.245.208.525.405.878.52a2.55 2.55 0 0 0 1.576 0c.353-.115.633-.312.878-.52.23-.195.484-.45.77-.735l7.795-7.795.754.754a1 1 0 1 0 1.414-1.414z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M17.87 1.793a1 1 0 0 1 1.414 0l1.448 1.448.014.013.013.014 1.448 1.448a1 1 0 1 1-1.414 1.414l-.755-.754-2.24 2.24L16.386 6.2l2.24-2.24-.755-.754a1 1 0 0 1 0-1.414Z"
			/>
			<path
				fill="currentColor"
				d="m4.981 18.088-.001-.002-.24-.24-2.947 2.947a1 1 0 1 0 1.414 1.414l2.947-2.947-.243-.243-.929-.928z"
			/>
			<path
				fill="currentColor"
				d="M9.831 8.37a1 1 0 0 1 1.414 0l2.193 2.192a1 1 0 1 1-1.415 1.414L9.832 9.784a1 1 0 0 1 0-1.414Z"
			/>
			<path
				fill="currentColor"
				d="M6.908 11.293a1 1 0 0 1 1.414 0l2.193 2.192A1 1 0 1 1 9.1 14.9l-2.192-2.192a1 1 0 0 1 0-1.414Z"
			/>
		</svg>
	)
}

export default IconSyringeInjectionDuoSolid
