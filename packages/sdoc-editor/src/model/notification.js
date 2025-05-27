import { generatorNotificationKey } from '../comment/utils';

class Notification {

  constructor(options) {
    this.id = options.id || '';
    this.comment_id = options?.detail?.comment_id || '';
    this.reply_id = options?.detail?.reply_id || '';
    this.type = options?.detail?.msg_type || '';
    this.key = this.type !== 'reply' ? generatorNotificationKey(this.comment_id) : generatorNotificationKey(this.comment_id, this.reply_id);
  }

}

export default Notification;
