// solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconGoogleChrome: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4.707 4.94A10.12 10.12 0 0 1 12 1.85c3.888 0 7.266 2.186 8.97 5.396h-8.974a4.76 4.76 0 0 0-4.323 2.773L5.438 6.152l-.577-1.008a1 1 0 0 0-.154-.204Z"
				fill="currentColor"
			/>
			<path
				d="M3.397 6.612A10.1 10.1 0 0 0 1.85 12c0 4.74 3.25 8.721 7.642 9.838l.004-.007.712-1.226.001-.003 2.232-3.869q-.22.021-.445.021a4.75 4.75 0 0 1-4.214-2.55L3.703 7.148z"
				fill="currentColor"
			/>
			<path
				d="M11.627 22.143q.186.007.373.007c5.606 0 10.15-4.544 10.15-10.15 0-.985-.14-1.938-.402-2.84a1 1 0 0 1-.405.086H15.87c.553.777.879 1.728.879 2.754 0 .935-.27 1.806-.736 2.541l-4.074 7.063-.001.002z"
				fill="currentColor"
			/>
			<path
				d="M11.996 14.754a2.75 2.75 0 0 1-2.347-1.312l-.035-.065-.073-.126a2.754 2.754 0 1 1 4.876.062q-.021.03-.04.064l-.07.12a2.75 2.75 0 0 1-2.311 1.257Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconGoogleChrome
