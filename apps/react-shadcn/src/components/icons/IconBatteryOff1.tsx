// icons/svgs/contrast/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconBatteryOff1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M17.53 6.304C16.797 6 15.865 6 14 6H8c-1.864 0-2.796 0-3.53.304A4 4 0 0 0 2.303 8.47C2 9.204 2 10.136 2 12s0 2.796.304 3.53a4 4 0 0 0 2.165 2.165c.413.172.889.247 1.557.28l11.62-11.62z"
				/>
				<path
					fill="currentColor"
					d="M20.298 8.754a1 1 0 0 1 .652.857c.05.618.05 1.383.05 2.345v.08c0 .901 0 1.629-.04 2.22-.042.61-.13 1.147-.34 1.657a5 5 0 0 1-2.707 2.706c-.51.211-1.048.299-1.656.34-.592.04-1.32.04-2.221.04h-2.39a1 1 0 0 1-.707-1.706l8.307-8.308a1 1 0 0 1 1.052-.231Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19.973 14c.465 0 .725 0 .915-.051a1.5 1.5 0 0 0 1.06-1.06C22 12.697 22 12.464 22 12s0-.697-.051-.888a1.5 1.5 0 0 0-1.06-1.06c-.191-.052-.45-.052-.916-.052M21 3l-3.354 3.354M3 21l3.026-3.026m11.62-11.62-.115-.05C16.796 6 15.864 6 14 6H8c-1.864 0-2.796 0-3.53.305a4 4 0 0 0-2.166 2.164C2 9.204 2 10.136 2 12s0 2.796.304 3.53a4 4 0 0 0 2.165 2.165c.413.172.889.247 1.557.28m11.62-11.62-11.62 11.62m13.927-8.282C20 10.269 20 11 20 12c0 1.864 0 2.796-.305 3.53a4 4 0 0 1-2.164 2.165C16.796 18 15.864 18 14 18h-2.354"
			/>
		</svg>
	)
}

export default IconBatteryOff1
