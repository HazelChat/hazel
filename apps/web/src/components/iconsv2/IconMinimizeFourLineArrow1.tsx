// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMinimizeFourLineArrow1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="M15.544 15.073A17.3 17.3 0 0 1 20 15.24l-.949.793a24 24 0 0 0-3.017 3.018L15.24 20a17.3 17.3 0 0 1-.168-4.456.52.52 0 0 1 .471-.471Z"
				/>
				<path
					fill="currentColor"
					d="M15.073 8.456A17.3 17.3 0 0 1 15.24 4l.793.949a24 24 0 0 0 3.017 3.017l.95.794a17.3 17.3 0 0 1-4.456.167.52.52 0 0 1-.471-.471Z"
				/>
				<path
					fill="currentColor"
					d="M8.927 8.456C9.064 6.98 9.007 5.482 8.76 4l-.794.949A24 24 0 0 1 4.95 7.966L4 8.76a17.3 17.3 0 0 0 4.456.167.52.52 0 0 0 .471-.471Z"
				/>
				<path
					fill="currentColor"
					d="M8.927 15.544c.137 1.476.08 2.974-.167 4.456l-.794-.949a24 24 0 0 0-3.017-3.017L4 15.24a17.3 17.3 0 0 1 4.456-.168.52.52 0 0 1 .471.471Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m21 21-3.524-3.524M3 3l3.525 3.525M3 21l3.525-3.525M21 3l-3.525 3.525m0 0a24 24 0 0 1-1.441-1.576L15.24 4a17.3 17.3 0 0 0-.168 4.456.52.52 0 0 0 .471.471c1.476.137 2.974.08 4.456-.167l-.949-.794a24 24 0 0 1-1.576-1.441Zm-10.95 0a24 24 0 0 0 1.441-1.576L8.76 4a17.3 17.3 0 0 1 .167 4.456.52.52 0 0 1-.471.471C6.98 9.064 5.482 9.007 4 8.76l.949-.794a24 24 0 0 0 1.576-1.441Zm0 10.95q.755.757 1.441 1.576L8.76 20a17.3 17.3 0 0 0 .167-4.456.52.52 0 0 0-.471-.471A17.3 17.3 0 0 0 4 15.24l.949.793q.82.686 1.576 1.441Zm10.95 0q.757-.755 1.576-1.441l.949-.793a17.3 17.3 0 0 0-4.456-.168.52.52 0 0 0-.471.471A17.3 17.3 0 0 0 15.24 20l.793-.948q.686-.821 1.442-1.576Z"
			/>
		</svg>
	)
}

export default IconMinimizeFourLineArrow1
