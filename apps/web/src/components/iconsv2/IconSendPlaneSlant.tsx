// solid/communication
import type { Component, JSX } from "solid-js"

export const IconSendPlaneSlant: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18.526 2.01c.83-.054 1.773.105 2.566.898s.952 1.736.898 2.566c-.036.566-.188 1.187-.308 1.675q-.057.234-.099.418a52.4 52.4 0 0 1-4.594 12.802c-1.114 2.167-4.185 2.166-5.342.046L9.66 16.77a1 1 0 0 1 .171-1.186l3.725-3.725a1 1 0 0 0-1.414-1.414L8.416 14.17a1 1 0 0 1-1.186.17l-3.645-1.988c-2.12-1.156-2.121-4.227.046-5.34a52.4 52.4 0 0 1 12.802-4.595q.184-.042.418-.1c.488-.119 1.11-.27 1.675-.308Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSendPlaneSlant
