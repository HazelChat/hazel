// solid/navigation
import type { Component, JSX } from "solid-js"

export const IconMapPinUser: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M12 2c-1.662 0-3.84.576-5.62 2.022-1.818 1.477-3.17 3.819-3.17 7.2 0 3.055 1.296 5.622 2.876 7.508q.278.33.563.631c.915.966 1.901 1.732 2.807 2.263.866.508 1.786.876 2.544.876.76 0 1.68-.369 2.545-.876.906-.531 1.892-1.297 2.806-2.263q.29-.305.57-.639c1.577-1.885 2.869-4.45 2.869-7.5 0-3.381-1.35-5.723-3.17-7.2C15.84 2.576 13.663 2 12 2ZM7.002 16.64a3.87 3.87 0 0 1 2.11-.622h5.777c.778 0 1.503.229 2.11.622-.34.486-.711.936-1.1 1.346-.789.833-1.628 1.48-2.366 1.913-.777.456-1.318.601-1.533.601s-.755-.145-1.532-.601c-.738-.433-1.577-1.08-2.367-1.913-.388-.41-.76-.86-1.1-1.346Zm1.578-5.85a3.421 3.421 0 1 1 6.842 0 3.421 3.421 0 0 1-6.842 0Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMapPinUser
