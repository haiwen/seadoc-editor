import { SeafileAPI } from 'seafile-js';

const { serviceUrl, username, password } = window.seafileConfig;
const seafileAPI = new SeafileAPI();
seafileAPI.init({ server: serviceUrl, username, password });


function getImageFileNameWithTimestamp(file) {
  var d = Date.now();
  return 'image-' + d.toString() + file.name.slice(file.name.lastIndexOf('.'));
}

class EditorApi {

  constructor(repoID, fileName, dirPath, name, filePath, serviceUrl, username, contact_email, repoName) {
    this.seafileAPI = seafileAPI;
    this.repoID = repoID;
    this.filePath = filePath;
    this.serviceUrl = serviceUrl;
    this.dirPath = dirPath;
    this.fileName = fileName;
    this.userName = username;
    this.contact_email = contact_email;
    this.name = name;
    this.repoName = repoName;
  }

  login() {
    return this.seafileAPI.login();
  }

  saveContent(content) {
    return (
      this.seafileAPI.getUpdateLink(this.repoID, this.dirPath).then((res) => {
        const uploadLink = res.data;
        return this.seafileAPI.updateFile(uploadLink, this.filePath, this.fileName, content);
      })
    );
  }

  unStarItem() {
    return this.seafileAPI.unstarItem(this.repoID, this.filePath);
  }

  starItem() {
    return this.seafileAPI.starItem(this.repoID, this.filePath);
  }

  createShareLink(userPassword, userValidDays) {
    return this.seafileAPI.createShareLink(this.repoID, this.filePath, userPassword, userValidDays);
  }

  getShareLink() {
    return this.seafileAPI.getShareLink(this.repoID, this.filePath);
  }

  deleteShareLink(token){
    return this.seafileAPI.deleteShareLink(token);
  }

  getCommentsNumber() {
    return this.seafileAPI.getCommentsNumber(this.repoID, this.filePath);
  }

  postComment(comment, detail) {
    return this.seafileAPI.postComment(this.repoID, this.filePath, comment, detail);
  }

  listComments() {
    return this.seafileAPI.listComments(this.repoID, this.filePath);
  }

  updateComment(commentID, resolved, detail, newComment) {
    return this.seafileAPI.updateComment(this.repoID, commentID, resolved, detail, newComment);
  }

  deleteComment(commentID) {
    return this.seafileAPI.deleteComment(this.repoID, commentID);
  }

  getUserAvatar(size) {
    return this.seafileAPI.getUserAvatar(this.userName, size);
  }

  getParentDectionaryUrl() {
    return this.serviceUrl + '/#common/lib/' + this.repoID + '/';
  }

  _getImageURL(fileName) {
    let url = this.serviceUrl + '/lib/' + this.repoID + '/file/images/auto-upload/' + fileName + '?raw=1';
    return url;
  }

  getFileContent(url) {
    return this.seafileAPI.getFileContent(url);
  }

  uploadLocalImage = (imageFile) => {
    return (
      this.seafileAPI.getUploadLink(this.repoID, '/').then((res) => {
        const uploadLink = res.data + '?ret-json=1';
        const newFile = new File([imageFile], getImageFileNameWithTimestamp(imageFile), { type: imageFile.type });
        const formData = new FormData();
        formData.append('parent_dir', '/');
        formData.append('relative_path', 'images/auto-upload');
        formData.append('file', newFile);
        return this.seafileAPI.uploadImage(uploadLink, formData);
      }).then ((res) => {
        return this._getImageURL(res.data[0].name);
      })
    );
  }

  getFileURL(fileNode) {
    var url;
    if (fileNode.type === 'file') {
      if (fileNode.isImage()) {
        url = this.serviceUrl + '/lib/' + this.repoID + '/file' + encodeURIComponent(fileNode.path()) + '?raw=1';
      } else {
        url = this.serviceUrl + '/lib/' + this.repoID + '/file' + encodeURIComponent(fileNode.path());
      }
    } else {
      url = this.serviceUrl + '/#common/lib/' + this.repoID + encodeURIComponent(fileNode.path());
    }
    return url;
  }

  isInternalFileLink(url) {
    // eslint-disable-next-line no-useless-escape
    var re = new RegExp(`${this.serviceUrl}/lib/[0-9a-f\-]{36}/file.*`);
    return re.test(url);
  }

  listFileHistoryRecords(page, perPage) {
    return this.seafileAPI.listFileHistoryRecords(this.repoID, this.filePath, page, perPage);
  }

  getFileHistoryVersion(commitID) {
    return this.seafileAPI.getFileRevision(this.repoID, commitID, this.filePath);
  }

  getFileInfo() {
    return this.seafileAPI.getFileInfo(this.repoID, this.filePath);
  }

  isInternalDirLink(url) {
    // eslint-disable-next-line no-useless-escape
    var re = new RegExp(`${this.serviceUrl}/#[a-z\-]*?/lib/[0-9a-f\-]{36}.*`);
    return re.test(url);
  }

  listSdocHistory(docUuid, page, perPage) {
    return this.seafileAPI.listSdocHistory(docUuid, page, perPage);
  }

  getFiles() {
    // return promise
    return this.seafileAPI.listDir(this.repoID, this.dirPath, { recursive: true } ).then((response) => {
      var files = response.data.map((item) => {
        return {
          name: item.name,
          type: item.type === 'dir' ? 'dir' : 'file',
          parent_path: item.parent_dir
        };
      });
      return files;
    });
  }

  getInternalLink() {
    return this.seafileAPI.getInternalLink(this.repoID, this.filePath);
  }

  getFileDownloadLink(repoID, filePath) {
    return this.seafileAPI.getFileDownloadLink(repoID, filePath);
  }

  getDraftKey = () => {
    return (this.repoID + this.filePath);
  }

  fileMetaData() {
    return this.seafileAPI.fileMetaData(this.repoID, this.filePath);
  }

  listFileTags() {
    return this.seafileAPI.listFileTags(this.repoID, this.filePath);
  }

  markdownLint(slateValue) {
    return this.seafileAPI.markdownLint(slateValue);
  }

  searchUsers(searchParam) {
    return this.seafileAPI.searchUsers(searchParam);
  }

  addFileParticipants = (emails) => {
    return this.seafileAPI.addFileParticipants(this.repoID, this.filePath, emails);
  }

  listRepoRelatedUsers() {
    return this.seafileAPI.listRepoRelatedUsers(this.repoID);
  }
}

const { repoID, fileName, dirPath, name, docPath, contact_email } = window.seafileConfig;
const editorApi = new EditorApi(repoID, fileName, dirPath, name, docPath, serviceUrl, username, contact_email);

export default editorApi;
