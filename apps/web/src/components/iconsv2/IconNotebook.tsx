// solid/general
import type { Component, JSX } from "solid-js"

export const IconNotebook: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11 5.197c0-.892-.588-1.688-1.462-1.866-2.621-.535-5.579-.536-8.034.867A1 1 0 0 0 1 5.067v15.5a1 1 0 0 0 1.394.919c2.607-1.118 5.852-.48 8.606.669z"
				fill="currentColor"
			/>
			<path
				d="M13 22.155c2.754-1.15 5.999-1.787 8.606-.67A1 1 0 0 0 23 20.568v-15.5a1 1 0 0 0-.504-.869c-2.455-1.403-5.413-1.402-8.034-.867C13.588 3.51 13 4.306 13 5.198z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconNotebook
