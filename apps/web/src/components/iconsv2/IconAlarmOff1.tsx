// contrast/time
import type { Component, JSX } from "solid-js"

export const IconAlarmOff1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="M12 4a9 9 0 0 0-6.901 14.777 1 1 0 0 0 1.473.065l11.27-11.27a1 1 0 0 0-.065-1.473A8.97 8.97 0 0 0 12 4Z"
				/>
				<path
					fill="currentColor"
					d="M20.42 9.814a1 1 0 0 0-1.643-.353L8.461 19.777a1 1 0 0 0 .353 1.642A9 9 0 0 0 20.42 9.814Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5 3 2 6m12.283 9.37.217.13m4.984-5.332A8 8 0 0 1 9.168 20.484m-3.303-2.35a8 8 0 0 1 11.27-11.27m-11.27 11.27L2 22m3.865-3.865L12 12m0 0v-2m0 2 5.135-5.135m0 0L20 4m2-2-2 2m0 0-1-1"
			/>
		</svg>
	)
}

export default IconAlarmOff1
