// solid/media
import type { Component, JSX } from "solid-js"

export const IconCaptionOn: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9.357 3C8.273 3 7.4 3 6.691 3.058c-.728.06-1.369.185-1.96.487A5 5 0 0 0 2.544 5.73c-.302.592-.428 1.233-.487 1.961C2 8.4 2 9.273 2 10.357v3.286c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.961a5 5 0 0 0 2.185 2.185c.592.302 1.233.428 1.961.487C7.4 21 8.273 21 9.357 21h5.286c1.084 0 1.958 0 2.666-.058.729-.06 1.369-.185 1.961-.487a5 5 0 0 0 2.185-2.185c.302-.592.428-1.232.487-1.961C22 15.6 22 14.727 22 13.643v-3.286c0-1.084 0-1.958-.058-2.666-.06-.728-.185-1.369-.487-1.96a5 5 0 0 0-2.185-2.186c-.592-.302-1.232-.428-1.961-.487C16.6 3 15.727 3 14.643 3zm.893 7a2 2 0 0 0-2 2v.5a2 2 0 0 0 2 2 1 1 0 1 1 0 2 4 4 0 0 1-4-4V12a4 4 0 0 1 4-4 1 1 0 1 1 0 2Zm4.5 2a2 2 0 0 1 2-2 1 1 0 1 0 0-2 4 4 0 0 0-4 4v.5a4 4 0 0 0 4 4 1 1 0 1 0 0-2 2 2 0 0 1-2-2z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCaptionOn
