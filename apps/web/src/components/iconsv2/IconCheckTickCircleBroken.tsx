// solid/general
import type { Component, JSX } from "solid-js"

export const IconCheckTickCircleBroken: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12c0-1.892-.517-3.662-1.419-5.179a24.64 24.64 0 0 0-7.42 8.067l-.359.628a1 1 0 0 1-1.624.158l-3.475-4.02a1 1 0 0 1 1.513-1.308l2.557 2.958a26.6 26.6 0 0 1 7.622-8.094A10.12 10.12 0 0 0 12 1.85Z"
				fill="currentColor"
			/>
			<path
				d="M19.545 5.21a10 10 0 0 1 1.186 1.611l.868-.592a1 1 0 0 0-1.128-1.651l-.793.54z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCheckTickCircleBroken
