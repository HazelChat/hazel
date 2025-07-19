// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconThumbReactionDislike: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.816 3.436c.39.198.741.458 1.043.767A3.5 3.5 0 0 1 22 6.5v6a3.5 3.5 0 0 1-5.865 2.58c-.24.423-.552.87-.979 1.484l-3.084 4.43c-.058.083-.127.183-.2.266a2 2 0 0 1-2.763.246c-.224-.18-.44-.41-.628-.626a4 4 0 0 1-.802-3.794c.115-.372.31-.719.404-1.096a.5.5 0 0 0-.398-.581c-.168-.021-.343-.009-.512-.009H4.746c-.446 0-.843 0-1.17-.028-.345-.03-.715-.097-1.068-.297a2.5 2.5 0 0 1-1.1-1.277c-.146-.378-.158-.755-.136-1.101.02-.327.08-.72.145-1.161l.543-3.631c.104-.694.19-1.27.297-1.738.112-.49.261-.933.527-1.343a4 4 0 0 1 1.7-1.465c.446-.203.906-.284 1.407-.322C6.37 3 6.95 3 7.653 3h3.588c.805 0 1.47 0 2.01.044.563.046 1.08.145 1.565.392ZM18.5 5A1.5 1.5 0 0 0 17 6.5v6a1.5 1.5 0 0 0 3 0v-6A1.5 1.5 0 0 0 18.5 5Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconThumbReactionDislike
