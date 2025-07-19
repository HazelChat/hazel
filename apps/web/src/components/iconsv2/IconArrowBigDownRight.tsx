// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigDownRight: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9.043 20.08a1 1 0 0 1-.472-1.773q1.136-.9 2.226-1.853l-6.29-6.29a9 9 0 0 1-.487-.511 2 2 0 0 1-.403-.687 2 2 0 0 1 0-1.236c.095-.29.254-.511.403-.686.135-.16.309-.333.487-.512l.023-.022 1.98-1.98.022-.023c.178-.178.352-.352.51-.487a2 2 0 0 1 .688-.402 2 2 0 0 1 1.236 0c.29.094.512.253.686.402q.266.233.512.487l.022.023 6.268 6.267a60 60 0 0 0 1.853-2.226 1 1 0 0 1 1.773.473 36.2 36.2 0 0 1 .182 9.354 2.11 2.11 0 0 1-1.864 1.865 36.3 36.3 0 0 1-9.355-.183Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowBigDownRight
