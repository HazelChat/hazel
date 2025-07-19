// solid/general
import type { Component, JSX } from "solid-js"

export const IconThermometerUp: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15 1a4 4 0 0 1 4 4v10a5 5 0 1 1-8 0V5a4 4 0 0 1 4-4Zm0 8a1 1 0 0 0-1 1v6.27A1.998 1.998 0 0 0 15 20a2 2 0 0 0 1-3.73V10a1 1 0 0 0-1-1ZM5.135 5.006c.267.022.53.112.763.268l.113.084A14 14 0 0 1 8.372 7.81l.058.085A1 1 0 0 1 6.773 9.01l-.224-.29A12 12 0 0 0 6 8.087v4.343a1 1 0 0 1-2 0V8.086q-.285.307-.548.635l-.223.289-.066.079a1 1 0 0 1-1.592-1.194l.058-.085.262-.338a14 14 0 0 1 2.1-2.114l.113-.084C4.375 5.092 4.688 5 5 5z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconThermometerUp
