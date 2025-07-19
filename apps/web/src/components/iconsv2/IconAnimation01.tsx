// solid/media
import type { Component, JSX } from "solid-js"

export const IconAnimation01: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.05 1.85a7.1 7.1 0 0 0-6.98 5.8 6.1 6.1 0 0 0-3.137 4.715 5.1 5.1 0 1 0 6.702 6.702 6.1 6.1 0 0 0 4.716-3.136 7.102 7.102 0 0 0-1.3-14.08ZM6.9 13a4.1 4.1 0 0 1 1.151-2.849 7.11 7.11 0 0 0 5.798 5.798 4.1 4.1 0 0 1-2.918 1.15 4.1 4.1 0 0 1-4.03-4.1Zm-3.05 4.05c0-1.019.492-1.924 1.252-2.49a6.11 6.11 0 0 0 4.337 4.338 3.1 3.1 0 0 1-5.59-1.848Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconAnimation01
