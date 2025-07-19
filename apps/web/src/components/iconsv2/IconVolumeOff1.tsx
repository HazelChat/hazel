// contrast/media
import type { Component, JSX } from "solid-js"

export const IconVolumeOff1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="M5 12.979V11.06a4.93 4.93 0 0 1 3.963-4.834 4.9 4.9 0 0 0 1.898-.822l2.813-2.01C15.066 2.402 17 3.397 17 5.108V7l-9.968 9.968A4.93 4.93 0 0 1 5 12.978Z"
				/>
				<path
					fill="currentColor"
					d="M17.383 11.724a1 1 0 0 1 .617.924v6.284c0 2.524-2.853 3.993-4.907 2.526l-2.725-1.946a1 1 0 0 1-.125-1.521l6.05-6.05a1 1 0 0 1 1.09-.217Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m22 2-5 5m0 0V5.107c0-1.71-1.934-2.706-3.326-1.711L10.86 5.405a4.9 4.9 0 0 1-1.899.822A4.93 4.93 0 0 0 5 11.061v1.918a4.93 4.93 0 0 0 2.032 3.989M17 7l-9.968 9.968m0 0L2 22m15-9.352v6.284c0 1.711-1.934 2.707-3.326 1.712l-2.724-1.946"
			/>
		</svg>
	)
}

export default IconVolumeOff1
