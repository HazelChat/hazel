// solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconBumble: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.618 2h6.93c.557 0 1.047-.001 1.503.147a3 3 0 0 1 1.08.624c.357.32.602.746.88 1.229l3.465 6c.279.483.524.907.624 1.377a3 3 0 0 1 0 1.247c-.1.47-.345.893-.624 1.376l-3.465 6c-.278.484-.523.909-.88 1.23-.312.28-.68.493-1.08.623-.456.149-.946.148-1.503.147h-6.93c-.557.001-1.047.002-1.504-.147-.4-.13-.768-.342-1.08-.623-.356-.321-.601-.746-.879-1.23L1.69 14c-.279-.483-.525-.907-.624-1.376a3 3 0 0 1 0-1.248c.1-.469.345-.893.624-1.375L5.155 4c.278-.483.523-.908.88-1.23a3 3 0 0 1 1.08-.623c.456-.148.946-.148 1.503-.147Zm.465 5.1a.9.9 0 1 0 0 1.8h6a.9.9 0 0 0 0-1.8zm-2 4a.9.9 0 1 0 0 1.8h10a.9.9 0 0 0 0-1.8zm3 4.045a.9.9 0 1 0 0 1.8h4a.9.9 0 0 0 0-1.8z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBumble
