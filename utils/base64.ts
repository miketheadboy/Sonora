export const base64ToBytes = (base64: string) => {
	const binString = atob(base64);
	return Uint8Array.from(binString, (m) => m.codePointAt(0) as number);
};

export const bytesToBase64 = (bytes: Uint8Array) => {
	const binString = Array.from(bytes, (x) => String.fromCodePoint(x)).join("");
	return btoa(binString);
};

export const base64ToBlob = (base64: string, mimeType: string): Blob => {
	const byteCharacters = atob(base64);
	const byteNumbers = new Array(byteCharacters.length);
	for (let i = 0; i < byteCharacters.length; i++) {
		byteNumbers[i] = byteCharacters.charCodeAt(i);
	}
	const byteArray = new Uint8Array(byteNumbers);
	return new Blob([byteArray], { type: mimeType });
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const base64String = (reader.result as string).split(',')[1];
			resolve(base64String);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
};