import { VALID_IMAGE_FILE_MIMETYPE } from './constants';

export const isValidImage = ({ type }) =>
  (type.match(VALID_IMAGE_FILE_MIMETYPE.regex) || []).length > 0;

/**
 * Recursively reads a directory entry and collects all files with relative paths.
 * @param {FileSystemDirectoryEntry} dirEntry
 * @param {string} parentPath - relative path prefix for this directory
 * @returns {Promise<Array<{ file: File, relativePath: string }>>}
 */
const readDirectoryEntry = (dirEntry, parentPath) =>
  new Promise((resolve, reject) => {
    const reader = dirEntry.createReader();
    const entries = [];

    const readBatch = () => {
      reader.readEntries((results) => {
        if (results.length === 0) {
          resolve(entries);
          return;
        }

        Promise.all(
          results.map(
            (entry) =>
              new Promise((resolveEntry) => {
                const entryPath = parentPath
                  ? `${parentPath}/${entry.name}`
                  : entry.name;

                if (entry.isFile) {
                  entry.file((file) => {
                    entries.push({ file, relativePath: entryPath });
                    resolveEntry();
                  });
                } else if (entry.isDirectory) {
                  readDirectoryEntry(entry, entryPath).then((nested) => {
                    entries.push(...nested);
                    resolveEntry();
                  });
                } else {
                  resolveEntry();
                }
              }),
          ),
        ).then(() => readBatch());
      }, reject);
    };

    readBatch();
  });

/**
 * Recursively traverses a DataTransfer's items and extracts all files with
 * relative paths (handles both flat file drops and folder drops).
 * @param {DataTransfer} dataTransfer
 * @returns {Promise<Array<{ file: File, relativePath: string }>>}
 */
export const getFilesFromDataTransfer = (dataTransfer) =>
  Promise.resolve().then(() => {
    const { items, files } = dataTransfer;

    // Use DataTransferItemList for folder traversal (available in Chrome/Edge/Firefox)
    if (items && items.length > 0 && typeof items[0].webkitGetAsEntry === 'function') {
      const itemPromises = Array.from(items)
        .map((item) => item.webkitGetAsEntry())
        .filter(Boolean)
        .map((entry) => {
          if (entry.isFile) {
            return new Promise((resolve) => {
              entry.file((file) => {
                // Remove leading slash from fullPath
                const relativePath = entry.fullPath.replace(/^\//, '');
                resolve([{ file, relativePath }]);
              });
            });
          }
          if (entry.isDirectory) {
            return readDirectoryEntry(entry, '');
          }
          return Promise.resolve([]);
        });

      return Promise.all(itemPromises).then((results) => results.flat());
    }

    // Fallback: flat file list (Safari, IE)
    return Array.from(files).map((file) => ({
      file,
      relativePath: file.webkitRelativePath || file.name,
    }));
  });
