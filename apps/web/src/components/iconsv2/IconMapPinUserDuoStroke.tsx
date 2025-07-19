// duo-stroke/navigation
import type { Component, JSX } from "solid-js"

export const IconMapPinUserDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 3c-2.92 0-7.79 2.056-7.79 8.222C4.21 17.39 10.054 21.5 12 21.5s7.79-4.111 7.79-10.278C19.79 5.056 14.922 3 12 3Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M17 16.64a3.87 3.87 0 0 0-2.11-.622H9.11c-.777 0-1.502.229-2.11.622a11.6 11.6 0 0 0 1.306 1.557c.244-.115.517-.18.804-.18h5.778c.288 0 .56.065.805.18A12 12 0 0 0 17 16.64Z"
			/>
			<path fill="currentColor" d="m6.103 18.75-.009-.01-.01-.013z" />
			<path fill="currentColor" d="M17.892 18.757z" />
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M12 6.868a3.921 3.921 0 1 0 0 7.843 3.921 3.921 0 0 0 0-7.843Zm-1.92 3.922a1.921 1.921 0 1 1 3.841 0 1.921 1.921 0 0 1-3.842 0Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconMapPinUserDuoStroke
