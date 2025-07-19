// icons/svgs/solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconTrezorWallet: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17 7v1.05a2.5 2.5 0 0 1 2 2.45v6.6a2.5 2.5 0 0 1-1.323 2.206l-4.5 2.402a2.5 2.5 0 0 1-2.354 0l-4.5-2.402A2.5 2.5 0 0 1 5 17.1v-6.6a2.5 2.5 0 0 1 2-2.45V7a5 5 0 0 1 10 0ZM9 7a3 3 0 1 1 6 0v1H9z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconTrezorWallet
