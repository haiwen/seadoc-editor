import axios from 'axios';

class SDocServerApi {

  constructor(options) {
    if (!options.docUuid) {
      throw new Error('settings has no docUuid');
    }
    if (!options.sdocServer) {
      throw new Error('settings has no sdocServer');
    }
    if (!options.accessToken) {
      throw new Error('settings has no accessToken');
    }

    this.server = options.sdocServer;
    this.docUuid = options.docUuid;
    this.accessToken = options.accessToken;
  }

  getDocContent() {
    const { server, docUuid, accessToken } = this;
    const url = `${server}/api/v1/docs/${docUuid}/`;

    return axios.get(url, { headers: { Authorization: `Token ${accessToken}` } });
  }

  getDocContentByDocUuid(docUuid) {
    const { server, accessToken } = this;
    const url = `${server}/api/v1/docs/${docUuid}/`;

    return axios.get(url, { headers: { Authorization: `Token ${accessToken}` } });
  }

  normalizeSdocContent() {
    const { server, docUuid, accessToken } = this;
    const url = `${server}/api/v1/docs/${docUuid}/normalize-sdoc`;

    return axios.get(url, { headers: { Authorization: `Token ${accessToken}` } });
  }

  saveDocContent(content) {
    const { server, docUuid, accessToken } = this;
    const url = `${server}/api/v1/docs/${docUuid}/`;

    const formData = new FormData();
    formData.append('doc_content', content);

    return axios.post(url, formData, { headers: { Authorization: `Token ${accessToken}` } });
  }

  getCollaborators() {
    const { server, docUuid, accessToken } = this;
    const url = `${server}/api/v1/docs/${docUuid}/collaborators/`;

    return axios.get(url, { headers: { Authorization: `Token ${accessToken}` } });
  }

  listComments() {
    const { server, docUuid, accessToken } = this;
    const url = `${server}/api/v1/docs/${docUuid}/comment/`;

    return axios.get(url, { headers: { Authorization: `Token ${accessToken}` } });
  }

  insertComment(comment) {
    const { server, docUuid, accessToken } = this;
    const url = `${server}/api/v1/docs/${docUuid}/comment/`;

    return axios.post(url, comment, { headers: { Authorization: `Token ${accessToken}` } });
  }

  deleteComment(commentId) {
    const { server, docUuid, accessToken } = this;
    const url = `${server}/api/v1/docs/${docUuid}/comment/${commentId}/`;

    return axios.delete(url, { headers: { Authorization: `Token ${accessToken}` } });
  }

  updateComment(commentId, newComment) {
    const { server, docUuid, accessToken } = this;
    const url = `${server}/api/v1/docs/${docUuid}/comment/${commentId}/`;

    return axios.put(url, newComment, { headers: { Authorization: `Token ${accessToken}` } });
  }

  updateCommentState(commentId, resolved) {
    const { server, docUuid, accessToken } = this;
    const url = `${server}/api/v1/docs/${docUuid}/comment/${commentId}/`;
    const newComment = {};
    if (resolved) {
      newComment.resolved = 'true';
    } else {
      newComment.resolved = 'false';
    }
    return axios.put(url, newComment, { headers: { Authorization: `Token ${accessToken}` } });
  }

  insertReply(commentId, reply) {
    const { server, docUuid, accessToken } = this;
    const url = `${server}/api/v1/docs/${docUuid}/comment/${commentId}/replies/`;

    return axios.post(url, reply, { headers: { Authorization: `Token ${accessToken}` } });
  }

  deleteReply(commentId, replyId) {
    const { server, docUuid, accessToken } = this;
    const url = `${server}/api/v1/docs/${docUuid}/comment/${commentId}/replies/${replyId}/`;

    return axios.delete(url, { headers: { Authorization: `Token ${accessToken}` } });
  }

  updateReply(commentId, replyId, reply) {
    const { server, docUuid, accessToken } = this;
    const url = `${server}/api/v1/docs/${docUuid}/comment/${commentId}/replies/${replyId}/`;

    return axios.put(url, reply, { headers: { Authorization: `Token ${accessToken}` } });
  }

}

export default SDocServerApi;
