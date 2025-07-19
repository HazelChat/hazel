// solid/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconFilePdfFormat: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13 1.001v2.24c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C17.29 9 17.954 9 18.758 9h2.24q.003.251.002.537V11H3V8.357c0-1.084 0-1.958.058-2.666.06-.728.185-1.369.487-1.96A5 5 0 0 1 5.73 1.544c.592-.302 1.233-.428 1.961-.487C8.4 1 9.273 1 10.357 1h2.106z"
				fill="currentColor"
			/>
			<path
				d="M15 1.283V3.2c0 .857 0 1.439.038 1.889.035.438.1.663.18.819a2 2 0 0 0 .874.874c.156.08.38.145.819.18C17.361 7 17.943 7 18.8 7h1.918a5 5 0 0 0-.455-.956c-.31-.506-.735-.93-1.35-1.545L17.5 3.085c-.614-.613-1.038-1.038-1.544-1.348A5 5 0 0 0 15 1.283Z"
				fill="currentColor"
			/>
			<path
				fill-rule="evenodd"
				d="M3 13a1 1 0 0 0-1 1v7a1 1 0 1 0 2 0v-1h.5a3.5 3.5 0 1 0 0-7zm1.5 5H4v-3h.5a1.5 1.5 0 0 1 0 3Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
			<path
				fill-rule="evenodd"
				d="M10 13a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h.5a4.5 4.5 0 1 0 0-9zm3 4.5a2.5 2.5 0 0 1-2 2.45v-4.9a2.5 2.5 0 0 1 2 2.45Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
			<path
				d="M17 13a1 1 0 0 0-1 1v7a1 1 0 1 0 2 0v-2h3a1 1 0 1 0 0-2h-3v-2h3a1 1 0 1 0 0-2z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconFilePdfFormat
