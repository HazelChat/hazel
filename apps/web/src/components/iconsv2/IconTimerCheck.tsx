// solid/time
import type { Component, JSX } from "solid-js"

export const IconTimerCheck: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M9 2a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-1v2.055A9.001 9.001 0 0 1 12 23a9 9 0 0 1-1-17.945V3h-1a1 1 0 0 1-1-1Zm6.84 9.436a1 1 0 0 1-.262 1.39 12.1 12.1 0 0 0-3.698 3.97 1 1 0 0 1-.872.504 1 1 0 0 1-.71-.293l-2.012-2.009a1 1 0 0 1 .71-1.707 1 1 0 0 1 .71.292l1.128 1.126a14.2 14.2 0 0 1 3.61-3.535A1 1 0 0 1 15.01 11a1 1 0 0 1 .83.436Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
			<path
				d="M18.66 4.615a1 1 0 0 1 1.413 0l1.061 1.06A1 1 0 0 1 19.72 7.09l-1.06-1.061a1 1 0 0 1 0-1.414Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconTimerCheck
