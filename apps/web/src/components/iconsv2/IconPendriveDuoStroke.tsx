// duo-stroke/devices
import type { Component, JSX } from "solid-js"

export const IconPendriveDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 8V4.4c0-.84 0-1.26-.164-1.581a1.5 1.5 0 0 0-.655-.656C14.861 2 14.441 2 13.6 2h-3.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656C8 3.139 8 3.559 8 4.4V8"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 8H8m4 14c-.929 0-1.393 0-1.782-.062a5 5 0 0 1-4.156-4.156C6 17.393 6 16.93 6 16v-4.8c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C7.52 8 8.08 8 9.2 8h5.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C18 9.52 18 10.08 18 11.2V16c0 .929 0 1.393-.062 1.782a5 5 0 0 1-4.156 4.156C13.393 22 12.93 22 12 22Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPendriveDuoStroke
