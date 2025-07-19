// duo-solid/ar-&-vr
import type { Component, JSX } from "solid-js"

export const IconGoogleCardboardVrDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17.241 5H6.76c-.805 0-1.47 0-2.01.044-.563.046-1.08.145-1.565.392a4 4 0 0 0-1.748 1.748c-.247.485-.346 1.002-.392 1.564C1 9.29 1 9.954 1 10.758v2.483c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C5.29 19 5.954 19 6.758 19h.134c.444 0 .834 0 1.207-.095a3 3 0 0 0 1.215-.638c.29-.252.512-.573.763-.939l1.432-2.074a.6.6 0 0 1 .987-.001l1.445 2.087c.248.358.465.673.749.92a3 3 0 0 0 1.237.648c.366.093.748.092 1.183.092h.131c.805 0 1.47 0 2.01-.044.563-.046 1.08-.145 1.565-.392a4 4 0 0 0 1.748-1.748c.247-.485.346-1.002.392-1.564.044-.541.044-1.206.044-2.01v-2.483c0-.805 0-1.47-.044-2.01-.046-.563-.145-1.08-.392-1.565a4 4 0 0 0-1.748-1.748c-.485-.247-1.002-.346-1.564-.392C18.71 5 18.046 5 17.242 5Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M18 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
			/>
		</svg>
	)
}

export default IconGoogleCardboardVrDuoSolid
