// solid/devices
import type { Component, JSX } from "solid-js"

export const IconMacbook: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M7.759 3c-.805 0-1.47 0-2.01.044-.563.046-1.08.145-1.565.392a4 4 0 0 0-1.748 1.748c-.247.485-.346 1.002-.392 1.564C2 7.29 2 7.954 2 8.758v6.51A2 2 0 0 0 1 17a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4 2 2 0 0 0-1-1.732v-6.51c0-.804 0-1.469-.044-2.01-.046-.562-.145-1.079-.392-1.564a4 4 0 0 0-1.748-1.748c-.485-.247-1.002-.346-1.564-.392C17.71 3 17.046 3 16.242 3zM8.5 15H4V8.8c0-.857 0-1.439.038-1.889.035-.438.1-.663.18-.819a2 2 0 0 1 .874-.874c.156-.08.38-.145.819-.18C6.361 5 6.943 5 7.8 5H10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1h2.2c.857 0 1.439 0 1.889.038.438.035.663.1.819.18a2 2 0 0 1 .874.874c.08.156.145.38.18.819C20 7.361 20 7.943 20 8.8V15h-5a1 1 0 0 0-.707.293l-.707.707H9.914l-.707-.707A1 1 0 0 0 8.5 15Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMacbook
