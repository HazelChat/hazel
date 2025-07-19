// icons/svgs/duo-solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconScreenCheckDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 20.875V17m0 3.875c-1.75 0-3.5.375-5 1.125m5-1.125c1.75 0 3.5.375 5 1.125"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M22.564 2.826a1 1 0 0 0-1.128-1.652 14 14 0 0 0-3.575 3.53l-1.154-1.153a1 1 0 1 0-1.414 1.415L17.33 7a1 1 0 0 0 1.574-.21 12 12 0 0 1 3.66-3.964ZM4.364 1h14.091q-.402.372-.777.771a3.001 3.001 0 0 0-3.798 4.61l2.036 2.034a3 3 0 0 0 4.724-.633A10 10 0 0 1 23 4.995v9.641c0 .39 0 .74-.024 1.03a2.5 2.5 0 0 1-.248.97 2.5 2.5 0 0 1-1.093 1.091 2.5 2.5 0 0 1-.968.25c-.292.023-.642.023-1.03.023H4.363c-.39 0-.74 0-1.03-.024a2.5 2.5 0 0 1-.969-.248 2.5 2.5 0 0 1-1.093-1.093 2.5 2.5 0 0 1-.248-.968q-.03-.514-.023-1.03V4.363c0-.39 0-.74.024-1.03.025-.313.083-.644.248-.969a2.5 2.5 0 0 1 1.093-1.093c.325-.165.656-.223.968-.248C3.625 1 3.976 1 4.364 1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconScreenCheckDuoSolid
