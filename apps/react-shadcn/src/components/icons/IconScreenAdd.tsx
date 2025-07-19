// icons/svgs/solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconScreenAdd: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4.364 1H16.17c-.11.313-.171.65-.171 1a3 3 0 0 0 0 6 3 3 0 0 0 6 0c.35 0 .687-.06 1-.17v6.806c0 .39 0 .74-.024 1.03a2.5 2.5 0 0 1-.248.969 2.5 2.5 0 0 1-1.093 1.092 2.5 2.5 0 0 1-.968.25c-.292.023-.642.023-1.03.023H13v1.913c1.552.118 3.085.511 4.447 1.193a1 1 0 1 1-.894 1.788c-1.346-.672-2.94-1.019-4.553-1.019s-3.207.347-4.553 1.02a1 1 0 1 1-.894-1.79c1.362-.68 2.895-1.074 4.447-1.192V18H4.364c-.39 0-.74 0-1.03-.024a2.5 2.5 0 0 1-.969-.248 2.5 2.5 0 0 1-1.093-1.093 2.5 2.5 0 0 1-.248-.968q-.032-.515-.024-1.03V4.363c0-.39 0-.74.024-1.03.025-.313.083-.644.248-.969a2.5 2.5 0 0 1 1.093-1.093c.325-.165.656-.223.968-.248C3.625 1 3.976 1 4.364 1Zm17.588.465c.225.16.422.358.583.583A3 3 0 0 0 22 2q0-.27-.048-.535ZM20 2a1 1 0 1 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 0 0 2 0V6h2a1 1 0 1 0 0-2h-2z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconScreenAdd
