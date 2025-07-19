// duo-solid/devices
import type { Component, JSX } from "solid-js"

export const IconSpeakerOffDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					fill-rule="evenodd"
					d="M10.357 1h3.286c1.084 0 1.958 0 2.666.058.729.06 1.369.185 1.961.487a5 5 0 0 1 1.546 1.225l1.477-1.477a1 1 0 1 1 1.414 1.414l-20 20a1 1 0 0 1-1.414-1.414l1.924-1.924a7 7 0 0 1-.17-1.206C3 17.483 3 16.653 3 15.635V8.357c0-1.084 0-1.958.058-2.666.06-.728.185-1.369.487-1.961A5 5 0 0 1 5.73 1.545c.592-.302 1.233-.428 1.961-.487C8.4 1 9.273 1 10.357 1Zm.143 5.503a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm-2.275 7.858c-.067.067-.177.013-.16-.08a4 4 0 0 1 3.216-3.216c.093-.017.147.093.08.16z"
					clip-rule="evenodd"
				/>
				<path
					fill="currentColor"
					d="M10.224 18.568a.545.545 0 0 0-.634.084l-2.582 2.581a1 1 0 0 0 .62 1.704C8.348 23 9.24 23 10.353 23h3.29c1.084 0 1.958 0 2.666-.058.729-.06 1.369-.185 1.961-.487a5 5 0 0 0 2.185-2.185c.302-.592.428-1.232.487-1.961C21 17.6 21 16.727 21 15.643V9.656a1 1 0 0 0-1.707-.707l-3.641 3.64a.545.545 0 0 0-.084.635c.276.539.432 1.143.432 1.776a4 4 0 0 1-4 4 3.9 3.9 0 0 1-1.776-.432Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 2 2 22"
			/>
		</svg>
	)
}

export default IconSpeakerOffDuoSolid
