// duo-solid/time
import type { Component, JSX } from "solid-js"

export const IconClockOffDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85c2.802 0 5.341 1.137 7.177 2.973a1 1 0 0 1 0 1.414L13 12.414V8a1 1 0 1 0-2 0v4.817c0 .425.18.826.489 1.108l-5.252 5.252a1 1 0 0 1-1.415 0A10.12 10.12 0 0 1 1.85 12Z"
				/>
				<path
					fill="currentColor"
					d="m13.2 15.04-4.902 4.902a1 1 0 0 0 .38 1.652c1.042.36 2.16.556 3.322.556 5.605 0 10.15-4.544 10.15-10.15 0-1.162-.196-2.28-.557-3.322a1 1 0 0 0-1.652-.38l-5.293 5.293.888.566a1 1 0 1 1-1.073 1.687z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 2 2 22"
			/>
		</svg>
	)
}

export default IconClockOffDuoSolid
