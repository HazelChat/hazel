// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconMetamaskStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21.89 6.32c.167-.66-.203-1.341-.413-1.95a1.5 1.5 0 0 0-1.86-.944l-4.901 1.508a1.5 1.5 0 0 1-.441.066H9.449a1.5 1.5 0 0 1-.46-.072l-4.6-1.478a1.5 1.5 0 0 0-1.877.942c-.206.602-.566 1.273-.403 1.924l1.139 4.542a4 4 0 0 1-.082 2.23l-.851 2.573a1.5 1.5 0 0 0-.012.905l.714 2.366a1.5 1.5 0 0 0 1.823 1.016l2.36-.631a1.5 1.5 0 0 1 1.259.229l1.645 1.175c.254.18.56.279.872.279h2.043a1.5 1.5 0 0 0 .87-.278l1.655-1.178a1.5 1.5 0 0 1 1.257-.227l2.364.63a1.5 1.5 0 0 0 1.822-1.012l.718-2.365a1.5 1.5 0 0 0-.013-.912l-.857-2.563a4 4 0 0 1-.085-2.246l1.142-4.53z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9.5 12c0 .544-.455 1-1 1s-1-.456-1-1c0-.545.455-1 1-1s1 .455 1 1Zm7 0c0 .544-.455 1-1 1s-1-.456-1-1c0-.545.455-1 1-1s1 .455 1 1Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMetamaskStroke
