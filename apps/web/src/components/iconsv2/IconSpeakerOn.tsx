// solid/devices
import type { Component, JSX } from "solid-js"

export const IconSpeakerOn: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M9 15a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" fill="currentColor" />
			<path
				fill-rule="evenodd"
				d="M10.357 1h3.286c1.084 0 1.958 0 2.666.058.729.06 1.369.185 1.961.487a5 5 0 0 1 2.185 2.185c.302.592.428 1.233.487 1.961C21 6.4 21 7.273 21 8.357v7.286c0 1.084 0 1.958-.058 2.666-.06.729-.185 1.369-.487 1.961a5 5 0 0 1-2.185 2.185c-.592.302-1.232.428-1.961.487C15.6 23 14.727 23 13.643 23h-3.286c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.96-.487a5 5 0 0 1-2.186-2.185c-.302-.592-.428-1.232-.487-1.961C3 17.6 3 16.727 3 15.643V8.357c0-1.084 0-1.958.058-2.666.06-.728.185-1.369.487-1.961A5 5 0 0 1 5.73 1.545c.592-.302 1.233-.428 1.961-.487C8.4 1 9.273 1 10.357 1ZM12 5.003a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM12 10a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSpeakerOn
