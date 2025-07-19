// solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconInstagram: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.772 2c-2.295 0-3.71 0-4.883.41a7.3 7.3 0 0 0-4.48 4.479C2 8.062 2 9.477 2 11.772v.456c0 2.295 0 3.71.41 4.883a7.3 7.3 0 0 0 4.479 4.48c1.173.41 2.588.41 4.883.41h.456c2.295 0 3.71 0 4.883-.41a7.3 7.3 0 0 0 4.48-4.48c.41-1.173.41-2.588.41-4.883v-.456c0-2.295 0-3.71-.41-4.883a7.3 7.3 0 0 0-4.48-4.48C15.938 2 14.523 2 12.228 2zm4.274 5a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 7.68a4.32 4.32 0 1 0 0 8.64 4.32 4.32 0 0 0 0-8.64Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconInstagram
