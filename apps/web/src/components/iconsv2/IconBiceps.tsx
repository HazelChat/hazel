// solid/sports
import type { Component, JSX } from "solid-js"

export const IconBiceps: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.198 1a3 3 0 0 1 2.496 1.336l.902 1.354.092.152a2 2 0 0 1-.221 2.241l-.12.13-1.609 1.61a3 3 0 0 1-1.237.74 15 15 0 0 0-.537-.948l-.181-.284-.06-.083a1 1 0 0 0-1.666 1.089l.052.088.306.493a12.6 12.6 0 0 1 1.677 7.724l-.075.575-.074.483a1 1 0 0 0 1.978.301l.073-.482a14.6 14.6 0 0 0-.134-5.142 6.9 6.9 0 0 1 2.885-1.858l.293-.091a6.93 6.93 0 0 1 4.472.23l1.604.643A3 3 0 0 1 23 14.086v4.716a3 3 0 0 1-2.576 2.97l-1.569.224a49 49 0 0 1-13.315.074l-.883-.124-1.01-.151a3 3 0 0 1-2.55-3.124l.154-2.921.036-.582a31 31 0 0 1 1.832-8.506L4.722 2.31l.06-.145A2 2 0 0 1 6.599 1z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBiceps
