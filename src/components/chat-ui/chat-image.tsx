export function ChatImage(props: { src: string; alt: string }) {
	return <img src={props.src} class="block size-full max-w-full object-cover" alt={props.alt} loading="lazy" />
}
