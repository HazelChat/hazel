// icons/svgs/duo-solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconBatteryThreeCellDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7.964 5c-.901 0-1.629 0-2.22.04-.61.042-1.148.13-1.657.34A5 5 0 0 0 1.38 8.088c-.212.51-.3 1.048-.34 1.656-.04.591-.04 1.319-.04 2.22v.072c0 .901 0 1.629.04 2.22.042.61.13 1.148.34 1.657a5 5 0 0 0 2.707 2.706c.51.212 1.048.3 1.656.34.592.041 1.32.041 2.221.041h6.072c.901 0 1.629 0 2.22-.04.61-.042 1.148-.13 1.657-.34a5 5 0 0 0 2.706-2.707 4.2 4.2 0 0 0 .262-.946q.137-.019.266-.052a2.5 2.5 0 0 0 1.768-1.768c.086-.323.086-.685.085-1.054v-.186c0-.369.001-.731-.085-1.054a2.5 2.5 0 0 0-1.768-1.768 2 2 0 0 0-.266-.052 4.2 4.2 0 0 0-.262-.946 5 5 0 0 0-2.706-2.706c-.51-.212-1.048-.3-1.656-.34C15.665 5 14.937 5 14.035 5z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 10v4m5-4v4m5-4v4"
			/>
		</svg>
	)
}

export default IconBatteryThreeCellDuoSolid
