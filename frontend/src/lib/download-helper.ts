import { storage } from "./firebase";
import { ref, getDownloadURL } from "firebase/storage";

export const downloadFile = async (storagePath: string): Promise<string> => {
  const sRef = ref(storage, storagePath);
  try {
    const url = await getDownloadURL(sRef);
    return url;
  } catch (error: any) {
    console.error("getDownloadURL failed", error);
    const code = error?.code;
    const serverResponse = error?.serverResponse;
    throw Object.assign(new Error(serverResponse?.error?.message || error?.message || String(error)), { code, serverResponse, original: error });
  }
};

export default downloadFile;
