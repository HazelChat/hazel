export const setCurrentServerId = (serverId: string) => {
	localStorage.setItem("currentServerId", serverId)
}

export const removeCurrentServerId = () => {
	localStorage.removeItem("currentServerId")
}

export const getCurrentServerId = (): string | null => {
	return localStorage.getItem("currentServerId")
}
