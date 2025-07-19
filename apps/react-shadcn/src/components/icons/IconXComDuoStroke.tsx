// icons/svgs/duo-stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconXComDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M7.586 3c.33 0 .661-.001.977.092.275.08.533.214.758.392.258.204.45.474.64.744l.044.063 9.643 13.614c.177.25.344.485.462.688.116.2.274.514.258.895-.018.466-.243.9-.612 1.185-.302.232-.649.284-.88.306a10 10 0 0 1-.828.02h-1.634c-.33.002-.66.002-.976-.09a2.3 2.3 0 0 1-.759-.393c-.258-.204-.449-.474-.639-.743l-.045-.064L4.373 6.125l-.02-.03a10 10 0 0 1-.462-.688c-.117-.2-.274-.514-.26-.895.02-.466.244-.9.614-1.185.302-.232.648-.284.88-.306.233-.02.521-.02.828-.02h1.633Zm.468 1.818c-.033-.01-.083-.018-.546-.018h-1.52l-.345.001.199.283 9.622 13.584c.268.378.303.414.33.435a.5.5 0 0 0 .152.078c.033.01.083.019.546.019h1.52l.346-.001q-.082-.118-.2-.283L8.536 5.332c-.267-.378-.303-.414-.33-.435a.5.5 0 0 0-.152-.079Z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path fill="currentColor" d="m14.3 10.353 5.127-5.86a.9.9 0 0 0-1.354-1.186l-4.844 5.536z" />
			<path fill="currentColor" d="m9.399 13.22 1.07 1.51-5.216 5.962a.9.9 0 1 1-1.355-1.185z" />
		</svg>
	)
}

export default IconXComDuoStroke
