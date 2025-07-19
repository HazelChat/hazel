// solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconCodepen: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11 1.705c-.412.106-.81.28-1.18.52l-7 4.55q-.386.25-.699.576l4.888 3.43 2.697-1.896c.4-.28.84-.479 1.294-.596z"
				fill="currentColor"
			/>
			<path
				d="M1.134 9.102A4 4 0 0 0 1 10.128v3.744q.001.532.136 1.035l4.133-2.904z"
				fill="currentColor"
			/>
			<path
				d="M2.127 16.655a4 4 0 0 0 .693.57l7 4.55c.37.24.768.414 1.18.52v-6.584a4 4 0 0 1-1.294-.596L7.01 13.224z"
				fill="currentColor"
			/>
			<path
				d="M13 22.295c.412-.106.81-.28 1.18-.52l7-4.55q.388-.252.702-.579l-4.886-3.424-2.702 1.893c-.4.28-.84.479-1.294.596z"
				fill="currentColor"
			/>
			<path
				d="M22.867 14.895q.132-.497.133-1.023v-3.744q0-.524-.132-1.02l-4.129 2.893z"
				fill="currentColor"
			/>
			<path
				d="M21.884 7.356a4 4 0 0 0-.704-.582l-7-4.55A4 4 0 0 0 13 1.705V8.29c.455.117.894.316 1.294.596l2.703 1.895z"
				fill="currentColor"
			/>
			<path
				d="M10.853 13.477 8.75 12l2.103-1.477a2 2 0 0 1 2.294 0L15.254 12l-2.107 1.476a2 2 0 0 1-2.294 0Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCodepen
