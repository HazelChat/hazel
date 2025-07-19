// solid/general
import type { Component, JSX } from "solid-js"

export const IconUploadBarUp: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13 10.429c1.625.038 3.249.169 4.863.392a1 1 0 0 0 .941-1.585 31.2 31.2 0 0 0-5.584-5.807 1.95 1.95 0 0 0-2.44 0 31.2 31.2 0 0 0-5.584 5.807 1 1 0 0 0 .941 1.585A43 43 0 0 1 11 10.429V16a1 1 0 1 0 2 0z"
				fill="currentColor"
			/>
			<path d="M5 19a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2z" fill="currentColor" />
		</svg>
	)
}

export default IconUploadBarUp
