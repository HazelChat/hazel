// solid/ar-&-vr
import type { Component, JSX } from "solid-js"

export const IconSpatialMark: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16.601 20.248a.2.2 0 0 0 .297.175l3.045-1.692A4 4 0 0 0 22 15.235v-.27a.2.2 0 0 0-.1-.172l-4.999-2.886a.2.2 0 0 0-.3.173z"
				fill="currentColor"
			/>
			<path
				d="M21.7 12.368a.2.2 0 0 0 .3-.173v-3.43a4 4 0 0 0-2.057-3.496l-.517-.287a.2.2 0 0 0-.197.001l-4.893 2.825a.2.2 0 0 0 .003.348l1.748.971.014.008z"
				fill="currentColor"
			/>
			<path
				d="M16.983 3.97a.2.2 0 0 0-.003-.347l-3.037-1.688a4 4 0 0 0-3.886 0l-.553.308a.2.2 0 0 0-.103.175v5.544a.2.2 0 0 0 .297.175l1.81-1.006z"
				fill="currentColor"
			/>
			<path
				d="M7.401 3.75a.2.2 0 0 0-.297-.174L4.057 5.269A4 4 0 0 0 2 8.765v.27a.2.2 0 0 0 .1.174l5.001 2.887a.2.2 0 0 0 .3-.173z"
				fill="currentColor"
			/>
			<path
				d="M2.3 11.634a.2.2 0 0 0-.3.173v3.428a4 4 0 0 0 2.057 3.496l.52.29a.2.2 0 0 0 .198-.002l4.891-2.824a.2.2 0 0 0-.002-.348l-1.748-.971-.015-.009z"
				fill="currentColor"
			/>
			<path
				d="M7.02 20.031a.2.2 0 0 0 .004.348l3.033 1.686a4 4 0 0 0 3.886 0l.555-.309a.2.2 0 0 0 .103-.175v-5.54a.2.2 0 0 0-.297-.175l-1.81 1.006z"
				fill="currentColor"
			/>
			<path
				d="M11.904 9.2a.2.2 0 0 1 .194 0l2.4 1.333a.2.2 0 0 1 .103.174v2.588a.2.2 0 0 1-.103.175l-2.4 1.333a.2.2 0 0 1-.194 0l-2.4-1.333a.2.2 0 0 1-.103-.175v-2.588a.2.2 0 0 1 .103-.174z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconSpatialMark
