// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconSidebarLeftOpenDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9 20.989C9.577 21 10.236 21 11 21h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 17.2 21 15.8 21 13v-2c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 3 15.8 3 13 3h-2c-.764 0-1.423 0-2 .011"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M9.7 2.298a1 1 0 0 1 .3.714V20.99a1 1 0 0 1-1.02 1c-1.534-.03-2.7-.132-3.704-.643a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.359C2 15.492 2 14.408 2 13.044v-2.087c0-1.363 0-2.447.071-3.322.074-.895.227-1.659.583-2.358a6 6 0 0 1 2.622-2.622c1.004-.512 2.17-.614 3.705-.643a1 1 0 0 1 .72.286Z"
			/>
			<path
				fill="currentColor"
				d="M14.088 8.191a1 1 0 0 0-1.176 1.618c.882.64 1.685 1.376 2.392 2.191-.707.815-1.51 1.55-2.392 2.191a1 1 0 0 0 1.176 1.618A16.3 16.3 0 0 0 17.2 12.85c.4-.497.4-1.203 0-1.7a16.3 16.3 0 0 0-3.112-2.959Z"
			/>
		</svg>
	)
}

export default IconSidebarLeftOpenDuoSolid
