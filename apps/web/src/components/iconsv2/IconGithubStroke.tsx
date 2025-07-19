// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconGithubStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10 15a3.72 3.72 0 0 0-1 2.58V21m5-6a3.72 3.72 0 0 1 1 2.58V21m-6-1.95a5.7 5.7 0 0 1-2.82.36c-1.52-.52-1.12-1.9-1.9-2.47A2.37 2.37 0 0 0 3 16.5m16-6.75c0 3-1.95 5.25-7 5.25s-7-2.25-7-5.25a6.3 6.3 0 0 1 .68-3c-.34-1.47-.21-3.28.52-3.64s2.27.3 3.54 1.15a13 13 0 0 1 2.26-.2 13 13 0 0 1 2.26.18c1.27-.85 2.88-1.48 3.54-1.15s.86 2.17.52 3.64A6.3 6.3 0 0 1 19 9.75Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGithubStroke
