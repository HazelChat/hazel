// solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconSketch: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.737 2.324a1 1 0 0 0-1.474 0l-1.108 1.21-.002.002L6.042 8H.698q.134-.354.362-.673L3.962 3.26A3 3 0 0 1 6.409 2H17.59c.972 0 1.884.47 2.448 1.26l2.902 4.067q.227.32.362.673h-5.344l-4.111-4.464-.002-.002z"
				fill="currentColor"
			/>
			<path
				d="M18.173 10h5.181c-.12.37-.312.722-.578 1.032l-8.492 9.917A3 3 0 0 1 12 22c-.84 0-1.684-.35-2.284-1.051l-8.493-9.917A3 3 0 0 1 .646 10h5.181l3.88 8.845q.015.037.035.072l1.378 2.557a1 1 0 0 0 1.76 0l1.378-2.557.036-.072z"
				fill="currentColor"
			/>
			<path d="M11.522 18.004 8.01 10h7.978l-3.51 8.004-.479.888z" fill="currentColor" />
			<path
				d="M11.626 4.889 8.76 8h6.479l-2.866-3.111-.002-.002L12 4.48l-.372.407z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSketch
