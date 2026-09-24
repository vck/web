export function slugifyTopic(tag: string): string {
	return tag.toLowerCase().trim().replace(/\s+/g, '-');
}
