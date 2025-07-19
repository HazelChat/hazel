// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconStarHalfFilledDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 19.126q.241 0 .476.055c.267.064.522.202 1.03.478 1.72.933 2.578 1.4 3.211 1.335a2.06 2.06 0 0 0 1.68-1.22c.257-.582.079-1.544-.277-3.466-.106-.57-.159-.855-.136-1.128.026-.32.126-.631.294-.906.143-.234.353-.434.773-.832 1.418-1.347 2.127-2.02 2.262-2.641a2.06 2.06 0 0 0-.642-1.975c-.474-.424-1.444-.552-3.382-.807-.574-.076-.862-.114-1.115-.22a2.06 2.06 0 0 1-.77-.56c-.179-.207-.304-.469-.553-.992-.842-1.764-1.263-2.646-1.813-2.967-.32-.186-.68-.28-1.038-.28"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6.711 8.019c-1.938.255-2.907.383-3.382.807a2.06 2.06 0 0 0-.642 1.975c.135.621.844 1.294 2.262 2.64.42.4.63.599.773.833.167.275.268.585.294.906.023.273-.03.558-.136 1.128-.356 1.922-.534 2.884-.277 3.465.3.68.941 1.146 1.68 1.221.633.064 1.492-.402 3.21-1.335.51-.276.764-.414 1.03-.478q.236-.055.477-.055V3c-.359 0-.717.093-1.038.28-.55.32-.97 1.203-1.813 2.967-.25.523-.374.785-.553.993-.21.244-.473.436-.77.56-.253.105-.54.143-1.115.219Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconStarHalfFilledDuoStroke
