// contrast/media
import type { Component, JSX } from "solid-js"

export const IconVolumeZero1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17 18.932V5.107c0-1.71-1.934-2.706-3.326-1.711L10.86 5.405a4.9 4.9 0 0 1-1.898.822A4.93 4.93 0 0 0 5 11.061v1.918a4.93 4.93 0 0 0 3.963 4.833c.683.137 1.33.417 1.898.823l2.813 2.009c1.392.994 3.326 0 3.326-1.712Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17 18.932V5.107c0-1.71-1.934-2.706-3.326-1.711L10.86 5.405a4.9 4.9 0 0 1-1.898.822A4.93 4.93 0 0 0 5 11.061v1.918a4.93 4.93 0 0 0 3.963 4.833c.683.137 1.33.417 1.898.823l2.813 2.009c1.392.994 3.326 0 3.326-1.712Z"
			/>
		</svg>
	)
}

export default IconVolumeZero1
