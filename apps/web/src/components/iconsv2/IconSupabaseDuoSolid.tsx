// duo-solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconSupabaseDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.45.975a1.5 1.5 0 0 1 1.03.35l.138.13.107.134c.223.322.256.689.27.857.022.25.021.57.021.91V16H6.761c-1.022 0-1.858.002-2.504-.057-.55-.05-1.114-.153-1.589-.448l-.198-.139a3 3 0 0 1-1.135-2.147l-.007-.17c-.009-.65.285-1.24.623-1.774.346-.548.856-1.21 1.478-2.021L8.788 2.26l.3-.387q.144-.183.27-.324c.13-.142.437-.475.904-.555z"
			/>
			<path
				fill="currentColor"
				d="M17.246 8c1.021 0 1.857-.001 2.502.058.55.05 1.114.152 1.589.447l.197.139a3 3 0 0 1 1.144 2.316c.008.65-.285 1.24-.622 1.773-.346.548-.855 1.211-1.477 2.022l-5.35 6.981-.3.388q-.145.182-.27.323c-.13.143-.437.476-.904.557l-.189.02a1.5 1.5 0 0 1-1.03-.35l-.137-.13-.109-.135c-.223-.322-.256-.688-.27-.856-.021-.25-.02-.57-.02-.911V8z"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconSupabaseDuoSolid
