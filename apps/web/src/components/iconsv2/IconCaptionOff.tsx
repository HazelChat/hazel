// solid/media
import type { Component, JSX } from "solid-js"

export const IconCaptionOff: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M22.707 2.707a1 1 0 0 0-1.414-1.414L19.115 3.47c-.549-.25-1.14-.359-1.806-.413C16.6 3 15.727 3 14.643 3H9.357C8.273 3 7.4 3 6.691 3.058c-.728.06-1.369.185-1.96.487A5 5 0 0 0 2.544 5.73c-.302.592-.428 1.233-.487 1.961C2 8.4 2 9.273 2 10.357v3.286c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.961a5 5 0 0 0 .718 1.052l-1.97 1.97a1 1 0 1 0 1.414 1.415l2.715-2.715.001-.001zM8.756 13.83a2 2 0 0 1-.506-1.33V12a2 2 0 0 1 2-2 1 1 0 1 0 0-2 4 4 0 0 0-4 4v.5a4 4 0 0 0 1.09 2.745z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
			<path
				d="m8.95 19.293 4.513-4.514A4 4 0 0 0 16.75 16.5a1 1 0 1 0 0-2 2 2 0 0 1-1.826-1.182l5.357-5.357a1 1 0 0 1 1.707.683C22 9.15 22 9.728 22 10.39v3.253c0 1.084 0 1.958-.058 2.666-.06.729-.185 1.369-.487 1.961a5 5 0 0 1-2.185 2.185c-.592.302-1.232.428-1.961.487C16.6 21 15.727 21 14.643 21H9.656a1 1 0 0 1-.707-1.707Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCaptionOff
