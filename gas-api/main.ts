interface FetchJsonpRequest {
  url: string,
  method: 'GET' | 'POST';
  body?: string;
}

interface FetchJsonpReuqustWithCallback extends FetchJsonpRequest {
  callback: string;
}

interface CookieClickerSaveData {
  CookieClickerGame: string;
}

interface PostSaveDataResponse {
  status: 'success' | 'failed'
}


const saveFileName = 'CookieClickSaveData';
const noSaveFileErrorMessage = 'there are no save file';


function getSaveDataFileId(): string {
  const saveFileIds = DriveApp.getFilesByName(saveFileName);
  if (saveFileIds.hasNext()) {
    return saveFileIds.next().getId();
  }
  const newFile = DocumentApp.create(saveFileName);
  return newFile.getId();
}

function getSaveDataDocument(): GoogleAppsScript.Document.Document {
  const saveFileId = getSaveDataFileId();
  return DocumentApp.openById(saveFileId);
}

function getSaveData() {
  const document = getSaveDataDocument();
  const body = document.getBody();
  return body.getText();
}

function updateSaveData(saveData: string) {
  const document = getSaveDataDocument();
  const body = document.getBody();
  body.clear();
  body.setText(saveData);
  document.saveAndClose();
}

function createJsonpResponse<T extends object>(
  responseContent: T,
  callback: string
): GoogleAppsScript.Content.TextOutput {
  const json = JSON.stringify(responseContent);
  const body = `${callback}(${json});`
  const content = ContentService.createTextOutput();
  content.setMimeType(ContentService.MimeType.JAVASCRIPT);
  content.setContent(body);
  return content;
}


function doGet(e: GoogleAppsScript.Events.DoGet) {
  const { method, callback, body } = e.parameter as any as FetchJsonpReuqustWithCallback;
  try {
    if (method === 'GET') {
      const saveData = getSaveData();
      return createJsonpResponse<CookieClickerSaveData>({
        CookieClickerGame: saveData
      }, callback);
    } else if (method === 'POST') {
      try {
        if (body) {
          const bodyJson = JSON.parse(body) as CookieClickerSaveData;
          updateSaveData(bodyJson.CookieClickerGame);
        }
        return createJsonpResponse<PostSaveDataResponse>({
          status: 'success'
        }, callback);
      } catch (e) {
        console.log(e);
        return createJsonpResponse<PostSaveDataResponse>({
          status: 'failed'
        }, callback);
      }
    }
  } catch(e) {
    console.log(e);
    return createJsonpResponse({
      CookieClickerGame: ''
    }, callback);
  }
}
