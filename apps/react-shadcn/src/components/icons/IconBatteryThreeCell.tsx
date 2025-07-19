// icons/svgs/solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconBatteryThreeCell: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7.964 5h6.072c.901 0 1.629 0 2.22.04.61.042 1.148.13 1.657.34a5 5 0 0 1 2.706 2.707c.126.302.207.615.262.946q.137.018.266.052a2.5 2.5 0 0 1 1.768 1.768c.086.323.086.685.085 1.054v.186c0 .369.001.731-.085 1.054a2.5 2.5 0 0 1-1.768 1.768q-.13.034-.266.052a4.2 4.2 0 0 1-.262.946 5 5 0 0 1-2.706 2.706c-.51.212-1.048.3-1.656.34-.592.041-1.32.041-2.221.041H7.964c-.901 0-1.629 0-2.22-.04-.61-.042-1.148-.13-1.657-.34a5 5 0 0 1-2.706-2.707c-.212-.51-.3-1.048-.34-1.656C1 13.665 1 12.937 1 12.036v-.072c0-.901 0-1.629.04-2.22.042-.61.13-1.148.34-1.657A5 5 0 0 1 4.088 5.38c.51-.212 1.048-.3 1.656-.34C6.335 5 7.063 5 7.964 5ZM7 10a1 1 0 0 0-2 0v4a1 1 0 1 0 2 0zm5 0a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0zm5 0a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBatteryThreeCell
