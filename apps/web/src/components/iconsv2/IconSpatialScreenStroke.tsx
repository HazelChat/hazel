// stroke/ar-&-vr
import type { Component, JSX } from "solid-js"

export const IconSpatialScreenStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16 21h-5m-9-7V7m19-1.4v9.8c0 .56 0 .84-.109 1.054a1 1 0 0 1-.437.437C20.24 17 19.96 17 19.4 17H6.6c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437C5 16.24 5 15.96 5 15.4V5.6c0-.56 0-.84.109-1.054a1 1 0 0 1 .437-.437C5.76 4 6.04 4 6.6 4h12.8c.56 0 .84 0 1.054.109a1 1 0 0 1 .437.437C21 4.76 21 5.04 21 5.6Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconSpatialScreenStroke
