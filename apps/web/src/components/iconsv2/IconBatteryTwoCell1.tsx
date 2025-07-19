// contrast/devices
import type { Component, JSX } from "solid-js"

export const IconBatteryTwoCell1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2 12c0-1.864 0-2.796.304-3.53A4 4 0 0 1 4.47 6.303C5.204 6 6.136 6 8 6h6c1.864 0 2.796 0 3.53.304a4 4 0 0 1 2.165 2.165C20 9.204 20 10.136 20 12s0 2.796-.305 3.53a4 4 0 0 1-2.164 2.165C16.796 18 15.864 18 14 18H8c-1.864 0-2.796 0-3.53-.305a4 4 0 0 1-2.166-2.164C2 14.796 2 13.864 2 12Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 14c.465 0 .698 0 .888-.051a1.5 1.5 0 0 0 1.06-1.06C22 12.697 22 12.464 22 12s0-.697-.051-.888a1.5 1.5 0 0 0-1.06-1.06C20.697 10 20.464 10 20 10M6 10v4m5-4v4m-3 4h6c1.864 0 2.796 0 3.53-.305a4 4 0 0 0 2.165-2.164C20 14.796 20 13.864 20 12s0-2.796-.305-3.53a4 4 0 0 0-2.164-2.166C16.796 6 15.864 6 14 6H8c-1.864 0-2.796 0-3.53.304A4 4 0 0 0 2.303 8.47C2 9.204 2 10.136 2 12s0 2.796.304 3.53a4 4 0 0 0 2.165 2.165C5.204 18 6.136 18 8 18Z"
			/>
		</svg>
	)
}

export default IconBatteryTwoCell1
