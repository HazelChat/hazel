// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMaximizeFourLineArrow1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path
					fill="currentColor"
					d="M3.073 3.544A17.3 17.3 0 0 0 3.24 8l.797-.952a24 24 0 0 1 3.01-3.01L8 3.24a17.3 17.3 0 0 0-4.456-.167.52.52 0 0 0-.471.471Z"
				/>
				<path
					fill="currentColor"
					d="M20.76 8a17.3 17.3 0 0 0 .167-4.456.52.52 0 0 0-.471-.471A17.3 17.3 0 0 0 16 3.24l.953.797c1.09.912 2.098 1.92 3.01 3.01z"
				/>
				<path
					fill="currentColor"
					d="M16 20.76a17.3 17.3 0 0 0 4.456.167.52.52 0 0 0 .471-.471A17.3 17.3 0 0 0 20.759 16l-.796.953a24 24 0 0 1-3.01 3.01z"
				/>
				<path
					fill="currentColor"
					d="M3.24 16a17.3 17.3 0 0 0-.167 4.456.52.52 0 0 0 .471.471A17.3 17.3 0 0 0 8 20.759l-.952-.796a24 24 0 0 1-3.01-3.01z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m15 15 3.524 3.524M9 9 5.475 5.475M9 15l-3.525 3.524M15 9l3.524-3.525m0 13.05a24 24 0 0 1-1.572 1.438l-.952.796c1.482.249 2.98.305 4.456.168a.52.52 0 0 0 .471-.471A17.3 17.3 0 0 0 20.759 16l-.796.953a24 24 0 0 1-1.439 1.572Zm0-13.05a24 24 0 0 1 1.439 1.573l.796.952c.249-1.482.305-2.98.168-4.456a.52.52 0 0 0-.471-.471A17.3 17.3 0 0 0 16 3.24l.953.797a24 24 0 0 1 1.572 1.438Zm-13.049 0a24 24 0 0 0-1.438 1.573L3.24 8a17.3 17.3 0 0 1-.167-4.456.52.52 0 0 1 .471-.471A17.3 17.3 0 0 1 8 3.24l-.952.797a24 24 0 0 0-1.573 1.438Zm0 13.05a24 24 0 0 1-1.438-1.572L3.24 16a17.3 17.3 0 0 0-.167 4.456.52.52 0 0 0 .471.471A17.3 17.3 0 0 0 8 20.759l-.952-.796a24 24 0 0 1-1.573-1.439Z"
			/>
		</svg>
	)
}

export default IconMaximizeFourLineArrow1
