// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconGiftStarDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M11 14H4a1 1 0 0 0-1 1v2.241c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C7.29 23 7.954 23 8.758 23H11z"
				/>
				<path
					fill="currentColor"
					d="M13 23v-9h7a1 1 0 0 1 1 1v2.241c0 .805 0 1.47-.044 2.01-.046.563-.145 1.08-.392 1.565a4 4 0 0 1-1.748 1.748c-.485.247-1.002.346-1.564.392-.541.044-1.206.044-2.01.044z"
				/>
			</g>
			<path fill="currentColor" d="M22 2a1 1 0 1 0-2 0 1 1 0 1 0 0 2 1 1 0 1 0 2 0 1 1 0 1 0 0-2Z" />
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M9.5 2a3.5 3.5 0 0 0-3.163 5H3.5a2.5 2.5 0 0 0 0 5H11V7h2v5h7.5a2.5 2.5 0 0 0 0-5h-2.837A3.5 3.5 0 0 0 12 3.05 3.5 3.5 0 0 0 9.5 2ZM13 7V5.5A1.5 1.5 0 1 1 14.5 7zm-2 0H9.5A1.5 1.5 0 1 1 11 5.5z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconGiftStarDuoSolid
