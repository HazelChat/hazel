// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconPlayBig: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15.357 5.47c-1.568-1.009-2.804-1.803-3.814-2.329s-1.95-.87-2.9-.801a5 5 0 0 0-3.646 1.99c-.57.762-.789 1.737-.893 2.873C4 8.336 4 9.806 4 11.669v.662c0 1.864 0 3.333.104 4.467.104 1.135.323 2.11.893 2.872a5 5 0 0 0 3.647 1.99c.949.069 1.888-.274 2.9-.8 1.009-.526 2.245-1.32 3.813-2.329l.52-.334c1.356-.872 2.433-1.564 3.226-2.183.802-.625 1.432-1.262 1.772-2.068a5 5 0 0 0 0-3.892c-.34-.806-.97-1.443-1.772-2.068-.793-.618-1.87-1.31-3.227-2.183z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPlayBig
