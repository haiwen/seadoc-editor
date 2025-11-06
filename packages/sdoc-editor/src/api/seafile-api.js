import axios from 'axios';
import slugid from 'slugid';

class SeafileAPI {

  constructor(server, token) {
    this.req = axios.create({
      baseURL: server,
      headers: {
        Authorization: 'Token ' + token
      }
    });
  }

  _sendPostRequest(url, form) {
    if (form.getHeaders) {
      return this.req.post(url, form, {
        headers: form.getHeaders()
      });
    } else {
      return this.req.post(url, form);
    }
  }

  getImageFileNameWithUuid(file) {
    return 'image-' + slugid.nice() + file.name.slice(file.name.lastIndexOf('.'));
  }

  uploadSdocImage(docUuid, imageFiles) {
    const url = '/api/v2.1/seadoc/upload-image/' + docUuid + '/';
    const form = new FormData();
    for (const fileItem of imageFiles) {
      if (fileItem.type.startsWith('image/')) {
        const fileName = this.getImageFileNameWithUuid(fileItem);
        const file = new File([fileItem], fileName, { type: fileItem.type });
        form.append('file', file);
      }
    }
    return this.req.post(url, form);
  }

  getSdocDownloadImageUrl(docUuid, imageName) {
    const url = '/api/v2.1/seadoc/download-image/' + docUuid + '/' + encodeURIComponent(imageName);
    return this.req.get(url);
  }

  getVideoFileNameWithUuid(file) {
    return 'video-' + slugid.nice() + file.name.slice(file.name.lastIndexOf('.'));
  }

  uploadSdocVideo(docUuid, videoFiles) {
    const url = '/api/v2.1/seadoc/upload-video/' + docUuid + '/';
    const form = new FormData();
    for (const fileItem of videoFiles) {
      if (fileItem.type.startsWith('video/')) {
        const fileName = this.getVideoFileNameWithUuid(fileItem);
        const file = new File([fileItem], fileName, { type: fileItem.type });
        form.append('file', file);
      }
    }
    return this.req.post(url, form);
  }

  // revision
  startRevise(repoID, fileUuid, path) {
    const url = '/api/v2.1/seadoc/start-revise/';
    let form = new FormData();
    form.append('p', path);
    form.append('repo_id', repoID);
    form.append('file_uuid', fileUuid);
    return this._sendPostRequest(url, form);
  }

  getSeadocOriginFileContent(docUuid) {
    const url = '/api/v2.1/seadoc/revision/origin-file-content/' + docUuid + '/';
    return this.req.get(url);
  }

  getSdocRevisionsCount(docUuid) {
    const url = 'api/v2.1/seadoc/revisions-count/' + docUuid + '/';
    return this.req.get(url);
  }

  getSdocRevisions(docUuid, page, perPage = 25) {
    const url = 'api/v2.1/seadoc/revisions/' + docUuid + '/?page=' + page + '&per_page=' + perPage;
    return this.req.get(url);
  }

  publishRevision(docUuid) {
    const url = '/api/v2.1/seadoc/publish-revision/' + docUuid + '/';
    return this.req.post(url);
  }

  updateSdocRevision(docUuid, docName, docContent = {}) {
    const url = 'api/v2.1/seadoc/revision/' + docUuid + '/';
    let formData = new FormData();
    const newFile = new File([JSON.stringify(docContent)], docName);
    formData.append('file', newFile);
    return this.req.put(url, formData);
  }

  deleteSdocRevision = (docUuid) => {
    const url = 'api/v2.1/seadoc/revision/' + docUuid + '/';
    return this.req.delete(url);
  };

  deleteSdocOtherRevision = (docUuid, revisionId) => {
    const url = 'api/v2.1/seadoc/delete-revision/' + docUuid + '/' + revisionId + '/';
    return this.req.delete(url);
  };

  getRevisionBaseVersionContent(docUuid) {
    const url = 'api/v2.1/seadoc/revision/base-version-content/' + docUuid + '/';
    return this.req.get(url);
  }

  getPublishedRevisionContent(docUuid) {
    const url = 'api/v2.1/seadoc/revision/published-content/' + docUuid + '/';
    return this.req.get(url);
  }

  // local files
  getSdocFiles(docUuid, p, type) {
    const url = 'api/v2.1/seadoc/dir/' + docUuid + '/?p=' + p + '&type=' + type + '&doc_uuid=' + docUuid;
    return this.req.get(url);
  }

  getSdocFileId(docUuid, p) {
    const url = 'api/v2.1/seadoc/file-uuid/' + docUuid + '/?p=' + p;
    return this.req.get(url);
  }

  asyncCopyImages(docUuid, originDocUuid, imageList) {
    const url = '/api/v2.1/seadoc/async-copy-images/' + docUuid + '/';
    return this.req.post(url, {
      origin_doc_uuid: originDocUuid,
      image_list: imageList
    });
  }

  getLinkFilesInfo(docUuid, filesUrl) {
    const url = '/api/v2.1/seadoc/files-info/' + docUuid + '/';
    return this.req.post(url, {
      files_url: filesUrl
    });
  }

  getCopyMoveProgressView(docUuid, taskId) {
    const url = 'api/v2.1/seadoc/query-copy-move-progress/' + docUuid + '/?&doc_uuid=' + docUuid + '&task_id=' + taskId;
    return this.req.get(url);
  }

  searchSdocFiles(docUuid, query, page, per_page) {
    const url = 'api/v2.1/seadoc/search-filename/' + docUuid + '/?query=' + query + '&page=' + page + '&per_page=' + per_page;
    return this.req.get(url);
  }

  searchFilesByFilename(docUuid, query, page, per_page, search_type) {
    const url = 'api/v2.1/seadoc/search-filename/' + docUuid + '/?query=' + query + '&page=' + page + '&per_page=' + per_page + '&search_type=' + search_type;
    return this.req.get(url);
  }

  // participants
  listParticipants(docUuid) {
    const url = 'api/v2.1/seadoc/participants/' + docUuid + '/';
    return this.req.get(url);
  }

  addParticipants(docUuid, emails) {
    const url = 'api/v2.1/seadoc/participants/' + docUuid + '/';
    const params = {
      emails: emails
    };
    return this._sendPostRequest(url, params);
  }

  deleteParticipants(docUuid, email) {
    const url = 'api/v2.1/seadoc/participant/' + docUuid + '/';
    const params = {
      email: email
    };
    return this.req.delete(url, { data: params });
  }

  // related-users
  listRelatedUsers(docUuid) {
    const url = 'api/v2.1/seadoc/related-users/' + docUuid + '/';
    return this.req.get(url);
  }

  // notification
  listUnseenNotifications(docUuid) {
    const url = `/api/v2.1/seadoc/notifications/${docUuid}/`;
    return this.req.get(url);
  }

  deleteUnseenNotifications(docUuid, notificationIds) {
    const url = `/api/v2.1/seadoc/notifications/${docUuid}/`;
    const params = {
      ids: notificationIds
    };
    return this.req.delete(url, { data: params });
  }

  readAllNotifications(docUuid) {
    const url = `/api/v2.1/seadoc/notifications/${docUuid}/`;
    return this.req.put(url);
  }

  aiTranslate(docUuid, text, lang) {
    const url = '/api/v2.1/ai/translate/';
    let form = new FormData();
    form.append('text', text);
    form.append('lang', lang);
    form.append('file_uuid', docUuid);

    return this.req.post(url, form);
  }

  writingAssistant(docUuid, text, type, custom_prompt) {
    const url = '/api/v2.1/ai/writing-assistant/';
    let form = new FormData();
    form.append('text', text);
    form.append('writing_type', type);
    if (custom_prompt) {
      form.append('custom_prompt', custom_prompt);
    }
    form.append('file_uuid', docUuid);

    return this.req.post(url, form);
  }

  getTokenByDocUuid(docUuid) {
    const url = `/api/v2.1/seadoc/access-token-by-uuid/${docUuid}/`;
    return this.req.get(url);
  }

  getFileMetadataInfo(docUuid, fileType) {
    const url = '/api/v2.1/seadoc/search-metadata-records/' + docUuid + '/?search_type=' + fileType;
    return this.req.get(url);
  }

  insertWikiView(wikiId, docUuid, data) {
    const url = `/api/v2.1/wiki2/${wikiId}/views/`;
    const form = new FormData();
    form.append('file_uuid', docUuid);
    form.append('name', data.view_name);
    form.append('type', data.view_type);
    form.append('link_repo_id', data.link_repo_id);

    return this.req.post(url, form);
  }

  duplicateWikiView(wikiId, docUuid, viewId) {
    const url = `/api/v2.1/wiki2/${wikiId}/duplicate-view/`;
    const form = new FormData();
    form.append('file_uuid', docUuid);
    form.append('view_id', viewId);

    return this.req.post(url, form);
  }
}

export default SeafileAPI;
