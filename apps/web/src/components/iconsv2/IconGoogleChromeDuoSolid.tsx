// duo-solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconGoogleChromeDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85A10.15 10.15 0 0 1 22.15 12c0 5.606-4.544 10.15-10.15 10.15a10.3 10.3 0 0 1-2.508-.312C5.099 20.72 1.85 16.74 1.85 12Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M20.97 7.246h-8.975a4.76 4.76 0 0 0-4.322 2.773L5.438 6.152 4.86 5.145a1 1 0 0 0-.154-.204 10.2 10.2 0 0 0-1.31 1.672l.306.536.002.004 4.077 7.052a4.75 4.75 0 0 0 4.658 2.53l-2.231 3.868-.002.003-.712 1.226-.003.007c.686.174 1.4.279 2.135.305l.311-.537.002-.002 4.074-7.063a4.73 4.73 0 0 0 .735-2.54 4.73 4.73 0 0 0-.878-2.755h5.471q.219-.001.405-.085a10 10 0 0 0-.777-1.915Zm-8.975 7.508a2.75 2.75 0 0 1-2.346-1.312l-.035-.065-.073-.126a2.754 2.754 0 1 1 4.876.062q-.021.03-.04.064l-.07.12a2.75 2.75 0 0 1-2.312 1.257Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconGoogleChromeDuoSolid
