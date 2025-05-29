import axios from 'axios';
import { SeafileAPI } from 'seafile-js';
import SDocServerApi from './api/sdoc-server-api';
import { getDirPath } from './utils';

class Context {

  constructor() {
    this.settings = window.seafile ? window.seafile : window.seafileConfig;
    this.api = null;
  }

  async initApi() {
    let seafileAPI = new SeafileAPI();
    const server = this.getSetting('serviceUrl');
    const username = this.getSetting('username');
    const password = this.getSetting('password');
    seafileAPI.init({ server, username, password });
    this.api = seafileAPI;
    await seafileAPI.login();
    const token = this.api.token;

    const isWiki = this.getSetting('isWiki');
    if (!isWiki) {
      const res = await this.getAccessToken(token);
      const { access_token } = res.data;
      this.settings = {
        ...this.settings,
        accessToken: access_token,
      };
    }

    this.sdocServerApi = new SDocServerApi(this.settings);
  }

  getSettings() {
    return this.settings;
  }

  getSetting(key) {
    if (this.settings[key] === false) return this.settings[key];
    return this.settings[key] || '';
  }

  getAccessToken = (token) => {
    const repoID = this.getSetting('repoID');
    const docUuid = this.getSetting('docUuid');
    const sourceID = repoID ? repoID : docUuid;

    const server = this.getSetting('serviceUrl');
    const docPath = this.getSetting('docPath');
    let url = `/api/v2.1/seadoc/access-token/${sourceID}/`;
    if (repoID) {
      url += `?p=${docPath}`;
    }

    return axios.get(url, {
      baseURL: server,
      headers: { Authorization: `Token ${token}` }
    });
  };

  getFileContent() {
    const isOpenSocket = this.getSetting('isOpenSocket');
    if (isOpenSocket) {
      return this.getFileContent1();
    }

    return this.getFileContent2();
  }

  saveContent(content) {
    const isOpenSocket = this.getSetting('isOpenSocket');
    if (isOpenSocket) {
      return this.saveContent1(content);
    }

    return this.saveContent2(content);
  }

  getFileContent1() {
    const settings = this.getSettings();
    const { docPath, docName } = settings;
    return this.sdocServerApi.getDocContent(docPath, docName);
  }

  saveContent1(content) {
    const settings = this.getSettings();
    const { docPath, docName } = settings;
    return this.sdocServerApi.saveDocContent(docPath, docName, content);
  }

  getFileContent2() {
    const repoID = this.getSetting('repoID');
    const docPath = this.getSetting('docPath');
    return this.api.getFileDownloadLink(repoID, docPath).then(res => {
      const downloadLink = res.data;
      return this.api.getFileContent(downloadLink);
    });
  }

  saveContent2(content) {
    const settings = this.getSettings();
    const { repoID, docPath, docName } = settings;

    const dirPath = getDirPath(docPath);
    return this.api.getUpdateLink(repoID, dirPath).then((res) => {
      const uploadLink = res.data;
      return this.api.updateFile(uploadLink, docPath, docName, content);
    });
  }

}

const context = new Context();

export default context;
