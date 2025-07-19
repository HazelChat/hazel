// duo-solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconXComDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.563 3.092C8.247 2.999 7.916 3 7.586 3H5.953c-.307 0-.595 0-.829.021-.23.022-.577.074-.88.306-.369.285-.594.72-.612 1.185-.015.381.142.694.259.895.117.203.284.438.461.688l9.643 13.614.045.064c.19.268.381.54.64.743.225.178.482.311.758.392.315.093.646.092.976.092h1.634c.306 0 .595 0 .828-.021.231-.022.578-.074.88-.306.37-.285.594-.72.612-1.185.016-.381-.142-.694-.258-.895-.118-.203-.285-.438-.462-.688L10.005 4.29l-.045-.063c-.19-.27-.38-.54-.639-.744a2.3 2.3 0 0 0-.758-.392Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="m14.3 10.353-1.07-1.51 4.843-5.536a.9.9 0 1 1 1.354 1.186z" />
			<path fill="currentColor" d="m9.399 13.22 1.07 1.51-5.216 5.962a.9.9 0 1 1-1.355-1.185z" />
		</svg>
	)
}

export default IconXComDuoSolid
