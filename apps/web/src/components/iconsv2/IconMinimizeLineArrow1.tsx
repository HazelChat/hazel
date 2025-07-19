// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMinimizeLineArrow1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.47 13.09a20.7 20.7 0 0 1-.215 5.311l-2.613-3.043L5.6 12.744c1.767-.3 3.552-.372 5.31-.214a.616.616 0 0 1 .561.56Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M12.53 10.91a20.7 20.7 0 0 1 .215-5.311l1.424 1.659a24 24 0 0 0 2.573 2.573l1.66 1.425c-1.768.3-3.553.372-5.312.214a.62.62 0 0 1-.56-.56Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15.573 8.427 20 4M8.427 15.573 4 20"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11.47 13.09a20.7 20.7 0 0 1-.215 5.311l-2.613-3.043L5.6 12.744c1.767-.3 3.552-.372 5.31-.214a.616.616 0 0 1 .561.56Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12.53 10.91a20.7 20.7 0 0 1 .215-5.311l1.424 1.659a24 24 0 0 0 2.573 2.573l1.66 1.425c-1.768.3-3.553.372-5.312.214a.62.62 0 0 1-.56-.56Z"
			/>
		</svg>
	)
}

export default IconMinimizeLineArrow1
