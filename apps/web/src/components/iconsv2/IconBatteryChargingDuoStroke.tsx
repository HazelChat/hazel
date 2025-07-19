// duo-stroke/devices
import type { Component, JSX } from "solid-js"

export const IconBatteryChargingDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20 14c.465 0 .698 0 .888-.051a1.5 1.5 0 0 0 1.06-1.06C22 12.697 22 12.464 22 12s0-.697-.051-.888a1.5 1.5 0 0 0-1.06-1.06C20.697 10 20.464 10 20 10m-4-3.973c.654.033 1.123.109 1.53.277a4 4 0 0 1 2.165 2.165C20 9.204 20 10.136 20 12s0 2.796-.305 3.53a4 4 0 0 1-2.164 2.165c-.59.245-1.307.293-2.531.303M7 6.002c-1.224.01-1.94.058-2.53.303a4 4 0 0 0-2.166 2.164C2 9.204 2 10.136 2 12s0 2.796.304 3.53a4 4 0 0 0 2.165 2.166c.408.168.876.244 1.531.277"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m12 6-3.831 4.98c-.367.478-.55.716-.542.9a.5.5 0 0 0 .225.393c.154.101.453.064 1.05-.01l4.196-.525c.597-.075.896-.112 1.05-.011a.5.5 0 0 1 .225.393c.009.184-.175.422-.542.9L10 18"
				fill="none"
			/>
		</svg>
	)
}

export default IconBatteryChargingDuoStroke
