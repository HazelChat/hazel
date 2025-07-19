// duo-solid/development
import type { Component, JSX } from "solid-js"

export const IconAutomationDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.004 18H9A6 6 0 0 1 9 6h5.85m-3.846 12a.6.6 0 0 0-.131-.37A12.5 12.5 0 0 0 8.66 15.5m2.343 2.5c0 .13-.044.262-.131.37A12.5 12.5 0 0 1 8.66 20.5"
				opacity=".28"
			/>
			<path fill="currentColor" d="M18 1.85a4.15 4.15 0 1 0 0 8.3 4.15 4.15 0 0 0 0-8.3Z" />
			<path
				fill="currentColor"
				d="M17.968 14c-.439 0-.817 0-1.13.021-.33.023-.66.072-.986.207a3 3 0 0 0-1.623 1.624 3 3 0 0 0-.207.986c-.022.313-.022.691-.022 1.13v.064c0 .439 0 .817.021 1.13.023.33.072.66.207.986a3 3 0 0 0 1.624 1.624c.326.135.656.184.986.207.313.021.691.021 1.13.021h.064c.439 0 .817 0 1.13-.021.33-.023.66-.072.986-.207a3 3 0 0 0 1.624-1.624c.135-.326.184-.656.207-.985.021-.314.021-.692.021-1.13v-.065c0-.439 0-.817-.021-1.13a3 3 0 0 0-.207-.986 3 3 0 0 0-1.624-1.623 3 3 0 0 0-.985-.208c-.314-.02-.692-.02-1.13-.02z"
			/>
		</svg>
	)
}

export default IconAutomationDuoSolid
