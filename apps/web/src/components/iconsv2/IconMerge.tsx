// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMerge: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 3c-.372 0-.739.13-1.035.376a21.6 21.6 0 0 0-3.78 4.074 1 1 0 0 0 .897 1.577l2.022-.167A23 23 0 0 1 11 8.804v3.826l-5.76 6.72a1 1 0 0 0 1.52 1.3l6-7A1 1 0 0 0 13 13V8.804q.449.02.896.056l2.022.167a1 1 0 0 0 .896-1.577 21.6 21.6 0 0 0-3.779-4.074A1.62 1.62 0 0 0 12 3Z"
				fill="currentColor"
			/>
			<path d="M15.33 15.35a1 1 0 1 0-1.518 1.3l3.429 4a1 1 0 1 0 1.518-1.3z" fill="currentColor" />
		</svg>
	)
}

export default IconMerge
