// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowLeftDown: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m6.485 9.1 3.325 3.676L17.884 4.7a1 1 0 0 1 1.414 1.415l-8.074 8.074 3.675 3.325a1 1 0 0 1-.522 1.73c-2.673.4-5.38.453-8.055.157a1.95 1.95 0 0 1-1.725-1.724 31.2 31.2 0 0 1 .157-8.055 1 1 0 0 1 1.73-.523Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowLeftDown
