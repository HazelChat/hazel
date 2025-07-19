// icons/svgs/solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconVideoCallOutgoing: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13 4a5 5 0 0 1 4.704 3.303l.366-.308C20.022 5.355 23 6.743 23 9.292v5.416c0 2.55-2.978 3.936-4.93 2.297l-.366-.308A5 5 0 0 1 13 20H6a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5zm-1.096 4.044a16 16 0 0 0-2.95.055l-.49.062a1 1 0 0 0 .182 1.99l.102-.01a14 14 0 0 1 1.835-.138l-4.29 4.287-.068.075a1 1 0 0 0 1.406 1.408l.076-.069 4.291-4.288q-.007.706-.084 1.408l-.055.428a1 1 0 0 0 1.96.384l.02-.1c.186-1.303.211-2.623.074-3.93l-.022-.149a1.7 1.7 0 0 0-1.495-1.37zM21 9.292a1 1 0 0 0-1.644-.766l-1 .84a1 1 0 0 0-.355.714v3.834c.013.278.141.54.355.72l1 .84A1 1 0 0 0 21 14.708z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconVideoCallOutgoing
