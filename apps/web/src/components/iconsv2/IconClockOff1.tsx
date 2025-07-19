// contrast/time
import type { Component, JSX } from "solid-js"

export const IconClockOff1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 2.803 1.137 5.342 2.972 7.177a1 1 0 0 0 1.415 0l12.94-12.94a1 1 0 0 0 0-1.414A10.12 10.12 0 0 0 12 1.85Z"
				/>
				<path
					fill="currentColor"
					d="M21.593 8.678a1 1 0 0 0-1.652-.38L8.298 19.942a1 1 0 0 0 .38 1.652c1.042.36 2.16.556 3.322.556 5.605 0 10.15-4.544 10.15-10.15 0-1.162-.196-2.28-.557-3.322Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 8v4m0 0 6.47-6.47M12 12l-6.47 6.47M22 2l-3.53 3.53m0 0A9.15 9.15 0 0 0 5.53 18.47m0 0L2 22m7.005-1.351A9.15 9.15 0 0 0 20.648 9.005m-5.86 5.86L15 15"
			/>
		</svg>
	)
}

export default IconClockOff1
