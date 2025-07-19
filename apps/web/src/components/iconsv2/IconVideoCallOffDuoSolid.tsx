// duo-solid/devices
import type { Component, JSX } from "solid-js"

export const IconVideoCallOffDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="M6 4a5 5 0 0 0-5 5v6a5 5 0 0 0 .217 1.461 1 1 0 0 0 1.664.416L14.037 5.72a1 1 0 0 0-.626-1.703A5 5 0 0 0 13 4z"
				/>
				<path
					fill="currentColor"
					fill-rule="evenodd"
					d="M23 9.292c0-2.55-2.978-3.937-4.93-2.297l-.366.307a5 5 0 0 0-.146-.36 1 1 0 1 0-1.823.824q.08.176.137.362L6 18q-.35 0-.675-.076a1 1 0 0 0-.448 1.95Q5.421 19.997 6 20h7a5 5 0 0 0 4.704-3.302l.366.307c1.952 1.64 4.93.252 4.93-2.297zm-4.999.788a1 1 0 0 1 .356-.714l1-.84A1 1 0 0 1 21 9.292v5.416a1 1 0 0 1-1.643.766l-1-.84a1 1 0 0 1-.356-.72z"
					clip-rule="evenodd"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 22 22 2"
			/>
		</svg>
	)
}

export default IconVideoCallOffDuoSolid
