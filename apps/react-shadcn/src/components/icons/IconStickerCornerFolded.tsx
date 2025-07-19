// icons/svgs/solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconStickerCornerFolded: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M2 7a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v1.2c0 .857 0 1.439-.038 1.889-.035.438-.1.663-.18.819a2 2 0 0 1-.874.874c-.156.08-.38.145-.819.18-.45.037-1.032.038-1.889.038h-2.038c-.528 0-.982 0-1.357.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167-.031.375-.031.83-.031 1.356V18.2c0 .857 0 1.439-.038 1.889-.035.438-.1.663-.18.819a2 2 0 0 1-.874.874c-.156.08-.38.145-.819.18C9.639 22 9.057 22 8.2 22H7a5 5 0 0 1-5-5zm11.471 14.988a9 9 0 0 0 8.517-8.517 4 4 0 0 1-.172.093c-.485.247-1.002.346-1.564.392-.541.044-1.206.044-2.01.044H16.2c-.577 0-.949 0-1.232.024-.272.022-.373.06-.422.085a1 1 0 0 0-.437.437c-.025.05-.063.15-.085.422C14 15.25 14 15.623 14 16.2v2.041c0 .805 0 1.47-.044 2.01-.046.563-.145 1.08-.392 1.565q-.044.087-.093.172Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconStickerCornerFolded
