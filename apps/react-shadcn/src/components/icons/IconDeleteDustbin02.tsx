// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconDeleteDustbin02: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M8.211 3.342a4.236 4.236 0 0 1 7.578 0L16.618 5H20a1 1 0 1 1 0 2h-1v8.036c0 .901 0 1.629-.04 2.22-.042.61-.13 1.148-.34 1.657a5 5 0 0 1-2.707 2.706c-.51.212-1.048.3-1.656.34-.592.041-1.32.041-2.221.041h-.072c-.901 0-1.629 0-2.22-.04-.61-.042-1.148-.13-1.657-.34a5 5 0 0 1-2.706-2.707c-.212-.51-.3-1.048-.34-1.656C5 16.665 5 15.937 5 15.035V7H4a1 1 0 1 1 0-2h3.382zM9.618 5 10 4.236a2.236 2.236 0 0 1 4 0l.382.764zM11 11a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0zm4 0a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconDeleteDustbin02
