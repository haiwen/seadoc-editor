import { DateUtils } from '../utils';

class Revision {

  constructor(options) {
    this.id = options.revision_id || '';

    // file info
    this.repoId = options.repo_id || '';
    this.docUuid = options.doc_uuid || '';
    this.filePath = options.file_path || '';
    this.filename = options.filename || '';
    this.parentPath = options.parent_path || '';

    // user
    this.nickname = options.nickname || '';

    // time
    this.createdTime = DateUtils.format(options.created_at || '', 'YYYY-MM-DD HH:MM');
    this.updatedTime = DateUtils.format(options.updated_at || '', 'YYYY-MM-DD HH:MM');

    // publish
    this.isPublished = options.is_published || false;
    this.publisher = options.publisher || '';
    this.publisherNickname = options.publisher_nickname || '';
    this.publishFileVersion = options.publish_file_version || '';

    // origin
    this.originDocUuid = options.origin_doc_uuid || '';
    this.originFilePath = options.origin_file_path || '';
    this.originFileVersion = options.origin_file_version || '';
    this.originFilename = options.origin_filename || '';
    this.originParentPath = options.origin_parent_path || '';
  }

}

export default Revision;
