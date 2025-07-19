// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconExternalLinkSquare1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				d="M19.902 4.543c.168 1.628.12 3.28-.142 4.913L18.614 8.11a24 24 0 0 0-2.722-2.722l-1.347-1.146A18.8 18.8 0 0 1 19.46 4.1a.496.496 0 0 1 .443.443Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 13.5c0 1.395 0 2.092-.138 2.667a5 5 0 0 1-3.695 3.695C15.592 20 14.894 20 13.5 20H12c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C4 16.2 4 14.8 4 12v-.5c0-2.33 0-3.495.38-4.413A5 5 0 0 1 7.088 4.38c.776-.322 1.73-.372 3.413-.38"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17.308 6.694 10 14.002m7.308-7.308q.681.681 1.306 1.416l1.146 1.346c.262-1.633.31-3.285.142-4.913a.495.495 0 0 0-.443-.443 18.8 18.8 0 0 0-4.913.142l1.346 1.146q.735.625 1.416 1.306Z"
			/>
		</svg>
	)
}

export default IconExternalLinkSquare1
