class User {

  constructor(options) {
    this.name = options.name || '';
    this.username = options.email || options.username || '';
    this.email = this.username;
    this.contact_email = options.contact_email || '';
    this.avatar_url = options.avatar_url || '';
    this.name_pinyin = options.name_pinyin || '';
  }

}

export default User;
