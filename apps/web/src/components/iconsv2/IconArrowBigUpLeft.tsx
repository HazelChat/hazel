// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigUpLeft: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.957 3.92a1 1 0 0 1 .472 1.774q-1.136.9-2.226 1.853l6.29 6.29q.254.246.487.51c.179.2.316.434.403.688a2 2 0 0 1 0 1.236c-.095.29-.254.51-.403.686-.135.16-.309.333-.487.512l-.023.022-1.98 1.98-.022.023a9 9 0 0 1-.51.487 2 2 0 0 1-.688.402 2 2 0 0 1-1.236 0 2 2 0 0 1-.686-.402 9 9 0 0 1-.512-.487l-.022-.023-6.268-6.267a60 60 0 0 0-1.853 2.226 1 1 0 0 1-1.773-.473 36.2 36.2 0 0 1-.182-9.354 2.11 2.11 0 0 1 1.864-1.865 36.3 36.3 0 0 1 9.355.183Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowBigUpLeft
