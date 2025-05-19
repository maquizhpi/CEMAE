import { CloudImage, Herramienta } from "../../models";
import uploadFile from "../firebase/uploadFile";


const checkFile = (file: File | CloudImage): boolean => {
  return (file as CloudImage)?.secure_url !== undefined ? true : false
}

export const UploadSolicitudeImages = async (
    factures: Array<Herramienta>
  ): Promise<Array<Herramienta>> => {
    for (let i = 0; i < factures.length; i++) {
      if(factures[i].file !== undefined) {
        if (!checkFile(factures[i].file)) {
          const data = await uploadFile(factures[i].file as File)
          factures[i].file = {
            secure_url: data,
          };
        }
      }
    }
    return factures;
  };