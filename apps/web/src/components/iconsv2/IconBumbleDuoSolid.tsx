// duo-solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconBumbleDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.618 2c-.557 0-1.047-.001-1.504.147a3 3 0 0 0-1.08.624c-.356.32-.601.745-.879 1.228L1.69 10.001c-.279.482-.525.906-.624 1.375a3 3 0 0 0 0 1.248c.1.469.345.893.624 1.375l3.465 6.002c.278.482.523.907.88 1.228a3 3 0 0 0 1.08.624c.456.148.946.148 1.503.147h6.93c.557 0 1.047.001 1.503-.147.4-.13.768-.342 1.08-.624.357-.32.602-.745.88-1.228l3.465-6.002c.279-.482.524-.906.624-1.375a3 3 0 0 0 0-1.248c-.1-.469-.345-.893-.624-1.375L19.01 3.999c-.278-.483-.523-.908-.88-1.228a3 3 0 0 0-1.08-.624c-.456-.148-.946-.148-1.503-.147z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7.083 12h10m-7 4.045h4M9.083 8h6"
			/>
		</svg>
	)
}

export default IconBumbleDuoSolid
