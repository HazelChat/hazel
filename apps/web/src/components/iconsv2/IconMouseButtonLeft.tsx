// solid/devices
import type { Component, JSX } from "solid-js"

export const IconMouseButtonLeft: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11 2.062A8 8 0 0 0 4 10h4.8c.577 0 .949 0 1.232-.024.272-.022.373-.06.422-.085a1 1 0 0 0 .437-.437c.025-.05.063-.15.085-.422.023-.283.024-.656.024-1.232z"
				fill="currentColor"
			/>
			<path
				d="M4 12v2a8 8 0 1 0 16 0v-4a8 8 0 0 0-7-7.938v5.776c0 .528 0 .982-.03 1.357-.033.395-.104.788-.297 1.167a3 3 0 0 1-1.311 1.31c-.379.194-.772.265-1.167.297-.375.03-.83.03-1.356.03z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMouseButtonLeft
