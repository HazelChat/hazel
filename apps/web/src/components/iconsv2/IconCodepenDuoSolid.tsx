// duo-solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconCodepenDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.18 2.224a4 4 0 0 0-4.36 0l-7 4.55A4 4 0 0 0 1 10.128v3.744a4 4 0 0 0 1.82 3.354l7 4.55a4 4 0 0 0 4.36 0l7-4.55A4 4 0 0 0 23 13.872v-3.744a4 4 0 0 0-1.82-3.354z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="m2.12 7.351 4.89 3.429 2.697-1.895c.4-.28.839-.479 1.294-.596V1.705a4 4 0 0 1 2 0v6.584c.455.117.893.316 1.294.596l2.703 1.895 4.887-3.424a4 4 0 0 1 .984 1.753L18.739 12l4.128 2.893a4 4 0 0 1-.985 1.752l-4.886-3.424-2.702 1.893c-.4.28-.84.479-1.294.596v6.584c-.656.17-1.344.17-2 0V15.71a4 4 0 0 1-1.294-.596l-2.696-1.89-4.883 3.43a4 4 0 0 1-.991-1.747l4.133-2.905-4.135-2.9a4 4 0 0 1 .987-1.75Zm8.733 6.126L8.75 12l2.103-1.477a2 2 0 0 1 2.294 0L15.254 12l-2.107 1.476a2 2 0 0 1-2.294 0Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconCodepenDuoSolid
