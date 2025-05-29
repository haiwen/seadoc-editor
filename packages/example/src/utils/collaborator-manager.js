import { EventBus, EXTERNAL_EVENT } from '@seafile/seafile-sdoc-editor';

const isValidEmail = function isValidEmail(email) {
  return /^[A-Za-z0-9]+([-_.][A-Za-z0-9]+)*@([A-Za-z0-9]+[-.])+[A-Za-z0-9]{2,20}$/.test(email);
};

class CollaboratorManager {

  constructor(mediaUrl, userService, collaborators, collaboratorsCache) {
    if (!Array.isArray(collaborators)) {
      collaborators = [];
    }
    if (!collaboratorsCache || typeof collaboratorsCache !== 'object') {
      collaboratorsCache = {};
    }

    if (!userService || typeof userService !== 'object') {
      throw new Error('userService is invalid');
    }

    if (!userService.listUserInfo) {
      throw new Error('userService muse be have a listUserInfo api');
    }

    const userMap = collaborators.reduce((map, user) => {
      map[user.email] = user;
      return map;
    }, {});
    this.emailUserMap = {
      ...userMap,
      ...collaboratorsCache,
    };
    this.mediaUrl = mediaUrl;
    this.userService = userService;
    this.isRequest = false;
    this.queryEmails = [];
    this.eventBus = EventBus.getInstance();
  }

  generateDefaultUser = (userEmail) => {
    // 1. email is invalid
    // 2. email is anonymous
    // 3. email is Automation Rule
    const defaultAvatarUrl = `${this.mediaUrl}avatars/default.png`;
    const user = {
      name: userEmail,
      email: userEmail,
      avatar_url: defaultAvatarUrl,
    };
    // update cache
    this.emailUserMap[userEmail] = user;
  };

  getEmailUserMap = (emails) => {
    let waitForFetchEmails = [];
    // get user from cache
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      if (!isValidEmail(email)) {
        this.generateDefaultUser(email);
        continue;
      }
      if (!this.emailUserMap[email]) {
        waitForFetchEmails.push(email);
      }
    }

    // all get user is in email user map
    if (waitForFetchEmails.length === 0) {
      return Promise.resolve(this.emailUserMap);
    }

    if (this.isRequest) {
      this.queryEmails = [...new Set([...this.queryEmails, ...waitForFetchEmails])];
      return Promise.resolve(null);
    } else {
      this.queryEmails = waitForFetchEmails;
      this.startQueryUsers();
      // Returns null, leaving the calling component still in the loading state
      return Promise.resolve(null);
    }

  };

  startQueryUsers = () => {
    if (this.queryEmails.length === 0) return;

    this.isRequest = true;
    const queryEmails = this.queryEmails.map(item => item);
    this.queryEmails = [];

    // intergrade env
    // this.userService.listUserInfo(queryEmails).then(res => {
    //   const { user_list } = res.data;
    //   user_list.forEach(user => {
    //     this.emailUserMap[user.email] = user;
    //   });
    //   this.eventBus.dispatch(EXTERNAL_EVENT.COLLABORATORS_UPDATED, this.emailUserMap);
    //   this.isRequest = false;
    //   this.startQueryUsers();
    // }).catch(err => {
    //   queryEmails.forEach(item => this.generateDefaultUser(item));
    //   this.eventBus.dispatch(EXTERNAL_EVENT.COLLABORATORS_UPDATED, this.emailUserMap);
    //   this.isRequest = false;
    //   this.startQueryUsers();
    // });

    // test env
    setTimeout(() => {
      queryEmails.forEach(item => this.generateDefaultUser(item));
      this.eventBus.dispatch(EXTERNAL_EVENT.COLLABORATORS_UPDATED, this.emailUserMap);
      this.isRequest = false;
      this.startQueryUsers();
    }, 300);
  };

}

export default CollaboratorManager;
