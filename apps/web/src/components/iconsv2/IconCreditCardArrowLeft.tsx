// solid/money-&-payments
import type { Component, JSX } from "solid-js"

export const IconCreditCardArrowLeft: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.643 3H8.357C7.273 3 6.4 3 5.691 3.058c-.728.06-1.369.185-1.961.487A5 5 0 0 0 1.545 5.73c-.302.592-.428 1.233-.487 1.961q-.012.15-.021.309h21.926l-.02-.309c-.06-.728-.186-1.369-.488-1.96a5 5 0 0 0-2.185-2.186c-.592-.302-1.232-.428-1.961-.487C17.6 3 16.727 3 15.643 3Z"
				fill="currentColor"
			/>
			<path
				fill-rule="evenodd"
				d="M1 13.643V10h22v3.643c0 1.084 0 1.958-.058 2.666a8 8 0 0 1-.105.81 3 3 0 0 0-.837-.118h-.62a3 3 0 0 0-4.77-1.972 16 16 0 0 0-2.806 2.703A3.6 3.6 0 0 0 13.141 21H8.357c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.961-.487a5 5 0 0 1-2.185-2.185c-.302-.592-.428-1.232-.487-1.961C1 15.6 1 14.727 1 13.643ZM5.85 12a1 1 0 1 0 0 2h3.3a1 1 0 1 0 0-2z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
			<path
				d="M19.01 18.23a1 1 0 1 0-1.2-1.6 14 14 0 0 0-2.452 2.362 1.6 1.6 0 0 0 0 2.02c.717.884 1.54 1.677 2.452 2.36a1 1 0 0 0 1.2-1.6 12 12 0 0 1-.927-.77H22a1 1 0 0 0 0-2h-3.916q.443-.41.926-.772Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconCreditCardArrowLeft
