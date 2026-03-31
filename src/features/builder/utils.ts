export function isDuplicateFile(file: File, prevFile?: File | null): boolean {
  if (!file || !prevFile) return false;
  return file.name === prevFile.name && file.size === prevFile.size && file.lastModified === prevFile.lastModified;
}
