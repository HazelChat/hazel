// duo-solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconFacebookDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.772 2h.456c2.295 0 3.71 0 4.883.41a7.3 7.3 0 0 1 4.48 4.479c.41 1.173.41 2.588.41 4.883v.456c0 2.295 0 3.71-.41 4.883a7.3 7.3 0 0 1-4.48 4.48c-1.173.41-2.588.41-4.883.41h-.456c-2.295 0-3.71 0-4.883-.41a7.3 7.3 0 0 1-4.48-4.48C2 15.938 2 14.523 2 12.228v-.456c0-2.295 0-3.71.41-4.883a7.3 7.3 0 0 1 4.479-4.48C8.062 2 9.477 2 11.772 2Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M11.996 22h-.224c-.66 0-1.246 0-1.776-.01V14h-1.25a1 1 0 1 1 0-2h1.25c0-.655.002-1.199.034-1.646.034-.481.108-.93.298-1.357a3.44 3.44 0 0 1 1.394-1.58c.416-.243.855-.336 1.303-.378C13.449 7 13.96 7 14.552 7h.044a1 1 0 1 1 0 2c-.649 0-1.067.001-1.385.03-.301.029-.418.076-.483.114a1.44 1.44 0 0 0-.573.667c-.055.123-.104.31-.13.686-.027.364-.029.83-.029 1.503h2.75a1 1 0 1 1 0 2h-2.75z"
			/>
		</svg>
	)
}

export default IconFacebookDuoSolid
