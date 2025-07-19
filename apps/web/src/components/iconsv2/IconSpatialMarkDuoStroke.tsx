// duo-stroke/ar-&-vr
import type { Component, JSX } from "solid-js"

export const IconSpatialMarkDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4.543 6.143A3 3 0 0 0 3 8.765v6.47a3 3 0 0 0 1.543 2.622l6 3.334a3 3 0 0 0 2.914 0l6-3.334A3 3 0 0 0 21 15.235v-6.47a3 3 0 0 0-1.543-2.622l-6-3.334a3 3 0 0 0-2.914 0z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="m22 14.85-5.399-3.117v8.855l-2 1.111v-5.998l-2.107 1.17-5.779 3.337-2.038-1.133 5.295-3.057-2.057-1.142-.014-.009L2 11.46V9.151l5.401 3.118V3.411l2-1.111v6.002l2.107-1.17 5.78-3.338 2.039 1.133-5.297 3.058 2.057 1.142.014.008L22 12.541zm-9.999-5.705 2.6 1.445v2.823l-2.6 1.444-2.6-1.444V10.59z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconSpatialMarkDuoStroke
