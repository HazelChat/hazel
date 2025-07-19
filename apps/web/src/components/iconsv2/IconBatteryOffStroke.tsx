// stroke/devices
import type { Component, JSX } from "solid-js"

export const IconBatteryOffStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19.973 14c.465 0 .725 0 .915-.051a1.5 1.5 0 0 0 1.06-1.06C22 12.697 22 12.464 22 12s0-.697-.051-.888a1.5 1.5 0 0 0-1.06-1.06c-.191-.052-.45-.052-.916-.052M21 3l-3.354 3.354M3 21l3.026-3.026m11.62-11.62-.115-.05C16.796 6 15.864 6 14 6H8c-1.864 0-2.796 0-3.53.305a4 4 0 0 0-2.166 2.164C2 9.204 2 10.136 2 12s0 2.796.304 3.53a4 4 0 0 0 2.165 2.165c.413.172.889.247 1.557.28m11.62-11.62-11.62 11.62m13.927-8.282C20 10.269 20 11 20 12c0 1.864 0 2.796-.305 3.53a4 4 0 0 1-2.164 2.165C16.796 18 15.864 18 14 18h-2.354"
				fill="none"
			/>
		</svg>
	)
}

export default IconBatteryOffStroke
