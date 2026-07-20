import { google } from "googleapis";

export type DriveFileItem = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string | null;
  size?: string | null;
  modifiedTime?: string | null;
  createdTime?: string | null;
};

/** File types we can read as plain text for RAG. */
export const SUPPORTED_MIME_TYPES = [
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/vnd.google-apps.document",
  "application/vnd.google-apps.spreadsheet",
];

export function createDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  return google.drive({ version: "v3", auth });
}

/** List non-trashed files from Google Drive. */
export async function listDriveFiles(
  accessToken: string,
): Promise<DriveFileItem[]> {
  const drive = createDriveClient(accessToken);

  const response = await drive.files.list({
    q: "trashed = false and mimeType != 'application/vnd.google-apps.folder'",
    fields:
      "files(id, name, mimeType, webViewLink, size, modifiedTime, createdTime)",
    pageSize: 100,
  });

  const files = response.data.files ?? [];

  return files
    .filter((file) => file.id && file.name && file.mimeType)
    .map((file) => ({
      id: file.id as string,
      name: file.name as string,
      mimeType: file.mimeType as string,
      webViewLink: file.webViewLink,
      size: file.size,
      modifiedTime: file.modifiedTime,
      createdTime: file.createdTime,
    }));
}

/** Download file content as plain text. */
export async function downloadDriveFileText(
  accessToken: string,
  file: DriveFileItem,
): Promise<string | null> {
  const drive = createDriveClient(accessToken);

  // Google Docs and Sheets must be exported, not downloaded directly.
  if (file.mimeType === "application/vnd.google-apps.document") {
    const response = await drive.files.export(
      {
        fileId: file.id,
        mimeType: "text/plain",
      },
      { responseType: "text" },
    );

    return typeof response.data === "string" ? response.data : null;
  }

  if (file.mimeType === "application/vnd.google-apps.spreadsheet") {
    const response = await drive.files.export(
      {
        fileId: file.id,
        mimeType: "text/csv",
      },
      { responseType: "text" },
    );

    return typeof response.data === "string" ? response.data : null;
  }

  const response = await drive.files.get(
    {
      fileId: file.id,
      alt: "media",
    },
    { responseType: "text" },
  );

  return typeof response.data === "string" ? response.data : null;
}

export function isSupportedMimeType(mimeType: string): boolean {
  return SUPPORTED_MIME_TYPES.includes(mimeType);
}
